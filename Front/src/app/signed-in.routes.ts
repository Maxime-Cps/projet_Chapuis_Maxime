import { Routes } from '@angular/router';
import { PAGE_TITLES, ROUTE_PATHS } from '../constants/routes';
import { pollutionIdGuard, unsavedChangesGuard } from '../guards/pollution.guards';

const loadPollutionForm = () => import('./pollution-form/pollution-form').then((m) => m.PollutionForm);

/** Pages reserved to signed-in users. Each one is a separate chunk, downloaded on first visit. */
export const SIGNED_IN_ROUTES: Routes = [
  {
    path: ROUTE_PATHS.report,
    loadComponent: loadPollutionForm,
    title: PAGE_TITLES.report,
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ROUTE_PATHS.list,
    loadComponent: () => import('./pollution-list/pollution-list').then((m) => m.PollutionList),
    title: PAGE_TITLES.list,
  },
  {
    path: ROUTE_PATHS.detail,
    loadComponent: () => import('./pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
    title: PAGE_TITLES.detail,
    canActivate: [pollutionIdGuard],
  },
  {
    path: ROUTE_PATHS.edit,
    loadComponent: loadPollutionForm,
    title: PAGE_TITLES.edit,
    canActivate: [pollutionIdGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ROUTE_PATHS.users,
    loadComponent: () => import('./user-list/user-list').then((m) => m.UserList),
    title: PAGE_TITLES.users,
  },
];
