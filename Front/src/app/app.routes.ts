import { Routes } from '@angular/router';
import { PollutionForm } from './pollution-form/pollution-form';
import { SignUp } from './sign-up/sign-up';
import { Login } from './login/login';
import { PollutionList } from './pollution-list/pollution-list';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PAGE_TITLES, ROUTE_PATHS } from '../constants/routes';
import { signedInGuard, signedOutGuard } from '../guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [signedInGuard],
    children: [
      { path: ROUTE_PATHS.report, component: PollutionForm, title: PAGE_TITLES.report },
      { path: ROUTE_PATHS.list, component: PollutionList, title: PAGE_TITLES.list },
      { path: ROUTE_PATHS.detail, component: PollutionDetail, title: PAGE_TITLES.detail },
      { path: ROUTE_PATHS.edit, component: PollutionForm, title: PAGE_TITLES.edit },
    ],
  },
  { path: ROUTE_PATHS.signUp, component: SignUp, title: PAGE_TITLES.signUp, canActivate: [signedOutGuard] },
  { path: ROUTE_PATHS.login, component: Login, title: PAGE_TITLES.login, canActivate: [signedOutGuard] },
  { path: '**', redirectTo: ROUTE_PATHS.report },
];
