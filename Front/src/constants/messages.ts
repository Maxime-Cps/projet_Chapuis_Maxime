/** User-facing error messages for pollution reports. */
export const POLLUTION_ERRORS = {
  listLoad: 'Impossible de charger les signalements.',
  load: 'Impossible de charger le signalement.',
  notFound: 'Signalement introuvable.',
  save: "L'enregistrement a échoué. Réessayez.",
  delete: 'La suppression a échoué. Réessayez.',
} as const;

/** User-facing error messages for a dropped image. */
export const IMAGE_ERRORS = {
  notImage: "Ce fichier n'est pas une image.",
  unreadable: 'Image illisible. Essayez un autre fichier.',
} as const;

/** User-facing error messages for the user list. */
export const USER_ERRORS = {
  listLoad: 'Impossible de charger les utilisateurs.',
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
