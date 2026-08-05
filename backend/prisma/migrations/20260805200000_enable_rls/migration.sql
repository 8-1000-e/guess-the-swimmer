-- Le backend se connecte en direct avec le rôle propriétaire, qui contourne la
-- RLS. L'activer sans aucune policy ferme l'accès via l'API PostgREST de
-- Supabase, joignable avec la clé anon publique.
ALTER TABLE "Swimmer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Round" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Guess" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
