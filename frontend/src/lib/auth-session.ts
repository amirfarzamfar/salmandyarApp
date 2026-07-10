"use client";

import type { AuthResponse } from "@/types/auth";
import { getJwtExpiryEpoch, isJwtExpired } from "@/lib/auth-jwt";

const authCookieName = "salmandyar_auth_token";
const authEventStorageKey = "salmandyar:auth:event";
const tokenStorageKey = "token";
const userStorageKey = "user";
const authChannelName = "salmandyar-auth";

type AuthEventReason = "login" | "logout" | "expired" | "invalid" | "replaced";
type StorageMode = "local" | "session";

let authBroadcastChannel: BroadcastChannel | null = null;

function canUseBrowserApis() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getSecureCookieFlag() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (!canUseBrowserApis()) {
    return;
  }

  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (getSecureCookieFlag()) {
    segments.push("Secure");
  }

  if (typeof maxAgeSeconds === "number" && maxAgeSeconds > 0) {
    segments.push(`Max-Age=${Math.floor(maxAgeSeconds)}`);
  }

  document.cookie = segments.join("; ");
}

function deleteCookie(name: string) {
  if (!canUseBrowserApis()) {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${getSecureCookieFlag() ? "; Secure" : ""}`;
}

export function readCookie(name: string) {
  if (!canUseBrowserApis()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

export function getCookieToken() {
  return readCookie(authCookieName);
}

export function getStoredToken() {
  if (!canUseBrowserApis()) {
    return null;
  }

  return localStorage.getItem(tokenStorageKey) ?? sessionStorage.getItem(tokenStorageKey) ?? getCookieToken();
}

export function getStoredUser() {
  if (!canUseBrowserApis()) {
    return null;
  }

  const rawUser = localStorage.getItem(userStorageKey) ?? sessionStorage.getItem(userStorageKey);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthResponse;
  } catch {
    return null;
  }
}

export function getStorageMode(): StorageMode {
  if (!canUseBrowserApis()) {
    return "session";
  }

  return localStorage.getItem(tokenStorageKey) ? "local" : "session";
}

function getCookieMaxAge(token: string, rememberMe: boolean) {
  if (!rememberMe) {
    return undefined;
  }

  const expiresAt = getJwtExpiryEpoch(token);
  if (!expiresAt) {
    return undefined;
  }

  return Math.max(expiresAt - Math.floor(Date.now() / 1000), 1);
}

function broadcastAuthChange(reason: AuthEventReason) {
  if (!canUseBrowserApis()) {
    return;
  }

  const payload = JSON.stringify({ reason, timestamp: Date.now() });
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: { reason } }));

  try {
    localStorage.setItem(authEventStorageKey, payload);
  } catch {
    // Ignore storage quota errors for auth sync.
  }

  if (typeof BroadcastChannel !== "undefined") {
    authBroadcastChannel ??= new BroadcastChannel(authChannelName);
    authBroadcastChannel.postMessage({ reason, timestamp: Date.now() });
  }
}

export function persistAuthSession(
  auth: AuthResponse,
  rememberMe: boolean,
  reason: AuthEventReason = "login",
  broadcast = true
) {
  if (!canUseBrowserApis()) {
    return;
  }

  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
  sessionStorage.removeItem(tokenStorageKey);
  sessionStorage.removeItem(userStorageKey);

  const targetStorage = rememberMe ? localStorage : sessionStorage;
  targetStorage.setItem(tokenStorageKey, auth.token);
  targetStorage.setItem(userStorageKey, JSON.stringify(auth));

  setCookie(authCookieName, auth.token, getCookieMaxAge(auth.token, rememberMe));
  if (broadcast) {
    broadcastAuthChange(reason);
  }
}

export function syncAuthSessionFromBrowserState() {
  if (!canUseBrowserApis()) {
    return;
  }

  const storageToken = localStorage.getItem(tokenStorageKey) ?? sessionStorage.getItem(tokenStorageKey);
  const cookieToken = getCookieToken();

  if (storageToken && isJwtExpired(storageToken, 5)) {
    clearAuthSession("expired");
    return;
  }

  if (cookieToken && isJwtExpired(cookieToken, 5)) {
    clearAuthSession("expired");
    return;
  }

  if (storageToken && !cookieToken) {
    clearAuthSession("invalid");
    return;
  }

  if (!storageToken && cookieToken) {
    sessionStorage.setItem(tokenStorageKey, cookieToken);
    return;
  }

  if (storageToken && cookieToken && storageToken !== cookieToken) {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    sessionStorage.removeItem(tokenStorageKey);
    sessionStorage.removeItem(userStorageKey);
    sessionStorage.setItem(tokenStorageKey, cookieToken);
  }
}

export function clearAuthSession(reason: AuthEventReason = "logout") {
  if (!canUseBrowserApis()) {
    return;
  }

  try {
    localStorage.clear();
    sessionStorage.clear();
  } finally {
    deleteCookie(authCookieName);
    broadcastAuthChange(reason);
  }
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!canUseBrowserApis()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === authEventStorageKey || event.key === tokenStorageKey || event.key === userStorageKey) {
      callback();
    }
  };

  const handleBrowserEvent = () => callback();
  const handleBroadcast = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("auth:changed", handleBrowserEvent);

  if (typeof BroadcastChannel !== "undefined") {
    authBroadcastChannel ??= new BroadcastChannel(authChannelName);
    authBroadcastChannel.addEventListener("message", handleBroadcast);
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("auth:changed", handleBrowserEvent);

    if (authBroadcastChannel) {
      authBroadcastChannel.removeEventListener("message", handleBroadcast);
    }
  };
}
