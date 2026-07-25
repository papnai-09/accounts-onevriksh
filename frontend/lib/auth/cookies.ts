import { cookies } from "next/headers";
import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";

const ACCESS_COOKIE = "onevriksh_access";
const REFRESH_COOKIE = "onevriksh_refresh";

const BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  accessToken: string,
  refreshToken: string,
  persist = true
) {
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...BASE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...BASE_OPTIONS,
    maxAge: persist ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
  });
}

export function getAuthCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    accessToken: cookieStore.get(ACCESS_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_COOKIE)?.value,
  };
}

export function clearAuthCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set(ACCESS_COOKIE, "", { ...BASE_OPTIONS, maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, "", { ...BASE_OPTIONS, maxAge: 0 });
}
