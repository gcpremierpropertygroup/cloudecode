import { NextRequest } from "next/server";

/**
 * Check if a request has valid admin authorization.
 * Uses Bearer token matching ADMIN_PASSWORD env var.
 */
export function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.ADMIN_PASSWORD;
}
