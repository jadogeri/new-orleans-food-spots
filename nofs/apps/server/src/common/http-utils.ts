import type { Request } from 'express';

export function buildHeaders(
  req: Request,
  token?: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') out[k] = v;
  }
  if (token) out['authorization'] = `Bearer ${token}`;
  return out;
}
