import type { ApiError } from '@/types/auth'

const MESSAGES: Record<string, string> = {
  'Guess too short': 'Login trop court',
  'Guess too long': 'Login trop long',
  'Not a valid login': 'Ce login n’existe pas',
  'Target already found': 'Cible déjà trouvée',
  'No target left': 'Plus aucune cible disponible',
  'Invalid token': 'Code QR invalide',
  'Token expired': 'Code QR expiré',
  'Round already validated': 'Manche déjà validée',
  'You are not the target': 'Tu n’es pas la cible de ce code',
  'You cannot sign your own round': 'Tu ne peux pas signer ton propre code',
  'Unknown player': 'Joueur inconnu',
  'Session expired': 'Session expirée',
  Unauthorized: 'Session expirée',
  'Bad Request': 'Requête refusée',
  'Failed to fetch': 'Serveur injoignable',
}

export function toFrench(e: ApiError): { title: string; detail?: string } {
  const known = MESSAGES[e.message]
  if (known) return { title: known }

  if (e.statusCode === 0)
    return {
      title: 'Serveur injoignable',
      detail: 'Vérifie que le back tourne sur le port 3000.',
    }

  return { title: 'Une erreur est survenue', detail: e.message }
}
