import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ServerClient } from "postmark";

function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    if (!user || !domain) return "***";
    return `${user.slice(0, 2)}***@${domain}`;
}

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();

    try {
        const body = await req.json().catch(() => null);
        const email = body?.email as string | undefined;
        const redirectTo = body?.redirectTo as string | undefined;

        if (!email || !redirectTo) {
            console.warn(`[magic-link][${requestId}] missing params`);
            return NextResponse.json(
                { error: "email e redirectTo são obrigatórios", requestId },
                { status: 400 }
            );
        }


        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: { redirectTo },
        });

        if (error) {
            console.error(`[magic-link][${requestId}] supabase error`, error);
            return NextResponse.json(
                { error: `Supabase: ${error.message}`, requestId },
                { status: 400 }
            );
        }

        const actionLink = data?.properties?.action_link;
        if (!actionLink) {
            console.error(`[magic-link][${requestId}] missing action_link`);
            return NextResponse.json(
                { error: "Não foi possível gerar o link de acesso.", requestId },
                { status: 500 }
            );
        }

        const token = process.env.POSTMARK_SERVER_TOKEN;
        const from = process.env.POSTMARK_FROM_EMAIL;

        if (!token || !from) {
            console.error(`[magic-link][${requestId}] missing postmark env`, {
                hasToken: !!token,
                from,
            });
            return NextResponse.json(
                { error: "Postmark não configurado (env vars faltando).", requestId },
                { status: 500 }
            );
        }

        const pm = new ServerClient(token);

        const result = await pm.sendEmailWithTemplate({
            From: from,
            To: email,
            TemplateId: 43618406,
            TemplateModel: {
                action_url: actionLink,
                year: new Date().getFullYear(),
            },
        });

        if (result?.ErrorCode && result.ErrorCode !== 0) {
            return NextResponse.json(
                {
                    error: `Postmark: ${result.Message || "Falha ao enviar"}`,
                    requestId,
                    postmark: result,
                },
                { status: 502 }
            );
        }

        return NextResponse.json({
            ok: true,
            requestId,
            postmark: {
                messageId: result?.MessageID,
                to: result?.To,
                submittedAt: result?.SubmittedAt,
            },
        });
    } catch (e: any) {
        console.error(`[magic-link][${requestId}] unexpected error`, e);
        return NextResponse.json(
            { error: e?.message || "Erro inesperado ao enviar o link.", requestId },
            { status: 500 }
        );
    }
}