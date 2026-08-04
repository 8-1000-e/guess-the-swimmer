-- Une même cible ne peut être validée qu'une fois par joueur.
-- Index unique partiel : Prisma ne sait pas l'exprimer dans schema.prisma.
-- Les manches non validées (playing / solved / expired) restent libres, donc
-- une cible ratée peut retomber un autre jour.
create unique index "rounds_validated_target_uniq"
  on "Round" ("playerId", "targetLogin")
  where status = 'validated';
