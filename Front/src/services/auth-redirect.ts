import { inject, Service } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { LINKS, REDIRECT_PARAM } from '../constants/routes';

/** Why a navigation leaves the signed-in pages, read by the guards through `extras.info`. */
enum SessionExit {
  SignOut = 'sign-out',
  Expired = 'expired',
}

/**
 * Navigation in and out of the signed-in pages, remembering the page to open once signed in.
 *
 * @example /pollutions/3 → /signup?redirect=%2Fpollutions%2F3 → sign-up → /pollutions/3
 */
@Service()
export class AuthRedirect {
  private readonly router = inject(Router);

  /** Sign-up page, carrying the URL being navigated to. */
  toSignUp(): UrlTree {
    return this.withTarget(LINKS.signUp, this.router.currentNavigation()?.extractedUrl.toString());
  }

  /** Opens the page remembered by {@link toSignUp} or {@link loginAfterExpiry}, or the pollution list. */
  resume(): Promise<boolean> {
    const target = this.router.routerState.snapshot.root.queryParamMap.get(REDIRECT_PARAM);
    return this.router.navigateByUrl(isInAppPath(target) ? target : LINKS.list);
  }

  /** Opens the sign-up page while still signed in. Resolves to false when a guard kept the user on the page. */
  leaveForSignOut(): Promise<boolean> {
    return this.router.navigateByUrl(LINKS.signUp, { info: SessionExit.SignOut });
  }

  /** Opens the login page after the API rejected the session, carrying the current URL. */
  loginAfterExpiry(): Promise<boolean> {
    const login = this.router.serializeUrl(this.withTarget(LINKS.login, this.router.url));
    return this.router.navigateByUrl(login, { info: SessionExit.Expired });
  }

  /** True during the navigation started by {@link leaveForSignOut}. */
  isSigningOut(): boolean {
    return this.router.currentNavigation()?.extras.info === SessionExit.SignOut;
  }

  /** True during the navigation started by {@link loginAfterExpiry}. */
  isExpiring(): boolean {
    return this.router.currentNavigation()?.extras.info === SessionExit.Expired;
  }

  /** `page` with the redirect parameter, left out for the home page. */
  private withTarget(page: string, target: string | undefined): UrlTree {
    const queryParams = target && target !== LINKS.report ? { [REDIRECT_PARAM]: target } : {};
    return this.router.createUrlTree([page], { queryParams });
  }
}

/** Rejects absent values and protocol-relative URLs such as `//evil.example`. */
function isInAppPath(url: string | null): url is string {
  return url !== null && url.startsWith('/') && !url.startsWith('//');
}
