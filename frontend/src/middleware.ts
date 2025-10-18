import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';
 

const publicAuthRoutes = ["/login", "/signup"];
const protectedRoutes = ["/home", "/profile", "/game", "/chat", "/settings"];

const secret = new TextEncoder().encode('pingpongsupersecretkey');

function matchesRoutes(path: string, routes: string[]) {
    return routes.some(r => path === r || path.startsWith(r + "/"));
}

const SKIP_MIDDLEWARE_ROUTES = [
  "/api/auth/", // All auth API routes
  "/auth/",     // All auth pages
  "/login",
  "/signup",
  "/oauth/",
  "/callback",  // OAuth callback routes
  "/success"
];


export default async function middleware(req: NextRequest) {


    const path = req.nextUrl.pathname;


    if (matchesRoutes(path, SKIP_MIDDLEWARE_ROUTES)) {
        return NextResponse.next();
    }

    const tokenCookie = req.cookies.get('token');
    const token = tokenCookie?.value;
    
    let isValid = false;
    
    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            // console.log("JWT payload:", payload);
            
            
            isValid = true;
        } catch (error) {
            console.log("Invalid token: ", error);
            const response  = NextResponse.redirect(new URL("/login", req.url));
            response.cookies.delete('token');
            return response;
        }
    }
    
    // if (isValid && path === '/login') {
    //     return NextResponse.redirect(new URL('/home', req.url));
    // }
        // If user has token and tries to access login page
        
    if (!isValid && matchesRoutes(path, protectedRoutes)) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isValid && matchesRoutes(path, publicAuthRoutes)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }


    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
