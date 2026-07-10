const roleClaimKeys = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  throw new Error("Base64 decoder is not available.");
}

export type JwtPayload = {
  exp?: number;
  sub?: string;
  [key: string]: unknown;
};

export function decodeJwtPayload(token?: string | null): JwtPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token?: string | null, clockSkewSeconds = 0) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp <= Math.floor(Date.now() / 1000) + clockSkewSeconds;
}

export function getJwtExpiryEpoch(token?: string | null) {
  return decodeJwtPayload(token)?.exp ?? null;
}

export function getJwtRoles(token?: string | null) {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  for (const key of roleClaimKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    if (Array.isArray(value)) {
      return value
        .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        .map((entry) => entry.trim());
    }
  }

  return [];
}

export function getPrimaryJwtRole(token?: string | null) {
  return getJwtRoles(token)[0] ?? null;
}
