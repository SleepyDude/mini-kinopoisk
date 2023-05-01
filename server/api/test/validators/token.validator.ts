
export function validateRefresh(cookieString: string): boolean {
    if (!cookieString.startsWith('refreshToken=')) return false;
    if (!cookieString.endsWith('HttpOnly')) return false;
    // const token = cookieString.split('=')[1].split(';')[0];
    // return token;
    return true;
}