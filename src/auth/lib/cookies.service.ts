import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';

interface CookiesServiceOptions {
  readonly cookieName: string;
  readonly cookieLifetime: number;
  readonly allowSameSiteNone: boolean;
  readonly cookieDomain?: string;
}

@Injectable()
export class CookiesService {
  private readonly cookieName: string;
  private readonly cookieLifetime: number;
  private readonly cookieDomain: string | undefined;
  /**
   * Whether 'same-site' cookie attribute can be 'none'.
   * Should be false in most cases.
   *
   * Should be true to allow cross-origin requests; this could be useful in
   * development mode, where a local frontend sends requests to remote backend.
   */
  private readonly allowSameSiteNone: boolean;

  constructor({
    cookieName,
    cookieDomain,
    cookieLifetime,
    allowSameSiteNone,
  }: CookiesServiceOptions) {
    this.cookieName = cookieName;
    this.cookieDomain = cookieDomain;
    this.cookieLifetime = cookieLifetime;
    this.allowSameSiteNone = allowSameSiteNone;
  }

  writeTokenInCookies(res: Response, userToken: string): void {
    const options = { ...this.getBaseOptions(), maxAge: this.cookieLifetime };
    res.cookie(this.cookieName, userToken, options);
  }

  removeTokenInCookies(res: Response): void {
    const value = '';
    const options = { ...this.getBaseOptions(), maxAge: -1 };
    res.cookie(this.cookieName, value, options);
  }

  private getBaseOptions(): CookieOptions {
    return {
      secure: this.allowSameSiteNone,
      domain: this.cookieDomain || undefined,
      sameSite: this.allowSameSiteNone ? 'none' : 'lax',
      httpOnly: true,
    };
  }
}
