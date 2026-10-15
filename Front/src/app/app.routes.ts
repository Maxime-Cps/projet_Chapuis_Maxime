import { Routes } from '@angular/router';
import { PollutionForm } from './pollution-form/pollution-form';
import { SignUp } from './sign-up/sign-up';

export const routes: Routes = [
  { path: '', component: PollutionForm },
  { path: 'signup', component: SignUp },
];
