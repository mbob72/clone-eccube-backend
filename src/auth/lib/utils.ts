import { Request as ExpressReq } from 'express';
import { ExtractJwt } from 'passport-jwt';

export const extractJwtTokenFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  extractTokenFromCookies,
]);

export function extractTokenFromCookies(req: ExpressReq): string | null {
  if (req && req.cookies) {
    const prop = process.env.COOKIE_NAME || 'token';
    return req.cookies[prop];
  }
  return null;
}
