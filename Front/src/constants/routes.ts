const REPORT = '';
const LIST = 'pollutions';
const SIGN_UP = 'signup';
const LOGIN = 'login';
const EDIT = 'edit';

/** Name of the route parameter holding a pollution id. */
export const ID_PARAM = 'id';

/** Path patterns for the router configuration. */
export const ROUTE_PATHS = {
  report: REPORT,
  list: LIST,
  detail: `${LIST}/:${ID_PARAM}`,
  edit: `${LIST}/:${ID_PARAM}/${EDIT}`,
  signUp: SIGN_UP,
  login: LOGIN,
} as const;

/** Browser tab title of each page. */
export const PAGE_TITLES = {
  report: 'Signaler une pollution',
  list: 'Pollutions signalées',
  detail: 'Détail du signalement',
  edit: 'Modifier le signalement',
  signUp: 'Créer un compte',
  login: 'Se connecter',
} as const;

/**
 * Absolute URLs for links and navigation, built from the same segments as {@link ROUTE_PATHS}.
 *
 * @example <a [routerLink]="links.detail(3)"> → /pollutions/3
 */
export const LINKS = {
  report: `/${REPORT}`,
  list: `/${LIST}`,
  signUp: `/${SIGN_UP}`,
  login: `/${LOGIN}`,
  detail: (id: number) => `/${LIST}/${id}`,
  edit: (id: number) => `/${LIST}/${id}/${EDIT}`,
} as const;
