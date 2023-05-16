export function validateRefresh(cookieString: string): boolean {
  if (!cookieString.startsWith('refreshToken=')) return false;
  if (!cookieString.endsWith('HttpOnly')) return false;
  return true;
}
