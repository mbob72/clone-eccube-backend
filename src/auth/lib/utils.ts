import { Request as ExpressReq } from 'express';

export function extractTokenFromCookies(req: ExpressReq): string | null {
  if (req && req.cookies) {
    const prop = process.env.COOKIE_NAME || 'token';
    return req.cookies[prop];
  }
  return null;
}
