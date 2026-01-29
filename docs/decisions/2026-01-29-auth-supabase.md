# Decision: Supabase Auth Implementation

**Date:** 2026-01-29  
**Status:** Accepted  
**Deciders:** Development Team

## Context

We need authentication for the GoHire Copilot application to allow users to save their insights and track their career progress over time.

## Decision

We chose Supabase Auth with the following configuration:

### Primary Authentication Methods

1. **Magic Link (Email OTP)** - Primary method
   - Low friction for users
   - No password to remember
   - Secure by default

2. **Google OAuth** - Secondary method
   - One-click sign up/in
   - Trusted provider
   - Good for users who prefer social login

### Implementation Details

- Using `@supabase/ssr` for server-side rendering compatibility
- Middleware handles session refresh and route protection
- Protected routes: `/dashboard/*`
- Public routes: `/`, `/comecar`, `/insight`, `/auth`

### File Structure

```
apps/web/
├── middleware.ts                    # Route protection
└── src/
    ├── app/
    │   ├── auth/
    │   │   ├── page.tsx            # Login/signup page
    │   │   ├── callback/route.ts   # OAuth callback handler
    │   │   └── signout/route.ts    # Sign out handler
    │   └── dashboard/
    │       └── page.tsx            # Protected dashboard
    └── lib/
        └── supabase/
            ├── client.ts           # Browser client
            ├── server.ts           # Server client
            └── middleware.ts       # Session management
```

## Consequences

### Positive

- Simple, passwordless authentication
- Good UX with magic links
- Scalable with Supabase infrastructure
- Easy to add more OAuth providers later

### Negative

- Depends on Supabase service availability
- Magic link delivery depends on email service

### Risks

- Email deliverability issues could block users
- Mitigation: Google OAuth as fallback

## Configuration Required

1. Create Supabase project at https://supabase.com
2. Enable Email auth and Google OAuth in Auth settings
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Configure redirect URLs in Supabase dashboard
