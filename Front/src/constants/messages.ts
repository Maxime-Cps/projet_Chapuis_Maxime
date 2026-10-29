/** User-facing error messages for pollution reports. */
export const POLLUTION_ERRORS = {
  listLoad: 'Impossible de charger les signalements.',
  load: 'Impossible de charger le signalement.',
  notFound: 'Signalement introuvable.',
  save: "L'enregistrement a échoué. Réessayez.",
  delete: 'La suppression a échoué. Réessayez.',
} as const;

/** User-facing error messages for sign-up. */
export const SIGN_UP_ERRORS = {
  emailTaken: 'Cet email est déjà utilisé.',
  unreachable: 'Serveur injoignable. Réessayez plus tard.',
  generic: "L'inscription a échoué. Réessayez.",
} as const;

/** User-facing error messages for login. */
export const LOGIN_ERRORS = {
  invalid: 'Email ou mot de passe incorrect.',
  unreachable: 'Serveur injoignable. Réessayez plus tard.',
  generic: 'La connexion a échoué. Réessayez.',
} as const;

/** Question asked before deleting a pollution report. */
export function deleteConfirmation(label: string): string {
  return `Supprimer « ${label} » ?`;
}
