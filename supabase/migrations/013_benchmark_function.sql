-- =============================================================
-- Função para calcular métricas de benchmark (bypassa RLS)
-- =============================================================

CREATE OR REPLACE FUNCTION get_benchmark_stats()
RETURNS JSON AS $$
DECLARE
  total_apps INT;
  users_with_3plus INT;
  taxa_media FLOAT;
  result JSON;
BEGIN
  -- Total de aplicações
  SELECT COUNT(*) INTO total_apps FROM applications;
  
  -- Se não tem dados suficientes, retorna null
  IF total_apps < 50 THEN
    RETURN NULL;
  END IF;
  
  -- Contar usuários com 3+ aplicações
  SELECT COUNT(*) INTO users_with_3plus
  FROM (
    SELECT user_id
    FROM applications
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  ) sub;
  
  -- Se não tem usuários suficientes, retorna null
  IF users_with_3plus < 10 THEN
    RETURN NULL;
  END IF;
  
  -- Calcular média de taxa de conversão
  SELECT AVG(taxa) INTO taxa_media
  FROM (
    SELECT 
      user_id,
      (COUNT(*) FILTER (WHERE status IN ('entrevista', 'proposta', 'aceito'))::FLOAT / COUNT(*)::FLOAT) * 100 as taxa
    FROM applications
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  ) sub;
  
  -- Montar resultado
  SELECT json_build_object(
    'total_applications', total_apps,
    'users_with_3plus', users_with_3plus,
    'taxa_conversao_media', ROUND(taxa_media::numeric, 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular percentil do usuário
CREATE OR REPLACE FUNCTION get_user_percentile(user_taxa FLOAT)
RETURNS INT AS $$
DECLARE
  total_users INT;
  users_below INT;
BEGIN
  -- Contar usuários com 3+ apps
  SELECT COUNT(*) INTO total_users
  FROM (
    SELECT user_id
    FROM applications
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  ) sub;
  
  IF total_users < 10 THEN
    RETURN 0;
  END IF;
  
  -- Contar usuários com taxa menor
  SELECT COUNT(*) INTO users_below
  FROM (
    SELECT 
      user_id,
      (COUNT(*) FILTER (WHERE status IN ('entrevista', 'proposta', 'aceito'))::FLOAT / COUNT(*)::FLOAT) * 100 as taxa
    FROM applications
    GROUP BY user_id
    HAVING COUNT(*) >= 3
  ) sub
  WHERE sub.taxa < user_taxa;
  
  RETURN ROUND((users_below::FLOAT / total_users::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
