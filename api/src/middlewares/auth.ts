import { NextFunction, Request, Response } from "express";
import { readToken } from "../utils/token";

const BEARER_PREFIX = "Bearer ";

/**
 * Rejects requests without a valid "Authorization: Bearer <token>" header (401).
 * On success, exposes the caller's id as res.locals.userId.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const userId = header.startsWith(BEARER_PREFIX) ? readToken(header.slice(BEARER_PREFIX.length)) : null;
  if (userId === null) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  res.locals.userId = userId;
  next();
}
