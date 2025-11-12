import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';
 

const publicAuthRoutes = [
    "/login", 
    "/signup",
    '/forgotPassword',
    '/resetPassword',
    '/verifyEmail',
    '/check-email',
    '/verify2fa'
];
const protectedRoutes = ["/home", "/profile", "/game", "/chat", "/settings"];

const secret = new TextEncoder().encode('pingpongsupersecretkey');

function matchesRoutes(path: string, routes: string[]) {
    return routes.some(r => path === r || path.startsWith(r + "/"));
}

const SKIP_MIDDLEWARE_ROUTES = [
  "/api/auth/",
  "/auth/", 
  "/login",
  "/signup",
  "/oauth/",
  "/callback",
  "/success",
];


export default async function middleware(req: NextRequest) {


    const path = req.nextUrl.pathname;


    if (
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.includes('.')
    ) {
        return NextResponse.next();
    }

    const tokenCookie = req.cookies.get('token');
    const token = tokenCookie?.value;
    
    let isAuthenticated = false;
    

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            isAuthenticated = true;

        } catch (error) {
            console.log("Invalid token: ", error);
            const response  = NextResponse.redirect(new URL("/login", req.url));
            response.cookies.delete('token');
            return response;
        }
    }
        
    if (!isAuthenticated && matchesRoutes(path, protectedRoutes)) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isAuthenticated && matchesRoutes(path, publicAuthRoutes)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
