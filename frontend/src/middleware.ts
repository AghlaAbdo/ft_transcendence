import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
// import jwt, { JwtPayload } from "jsonwebtoken";

import { jwtVerify } from 'jose';
 

const publicAuthRoutes = ["/login", "/signup"];
const protectedRoutes = ["/home", "/profile", "/game", "/chat", "/settings"];

const secret = new TextEncoder().encode('pingpongsupersecretkey');

function matchesRoutes(path: string, routes: string[]) {
    return routes.some(r => path === r || path.startsWith(r + "/"));
}

export default async function middleware(req: NextRequest) {
    // const token = req.cookies.get('token')?.value;

    const tokenCookie = req.cookies.get('token');
    const token = tokenCookie?.value;
    
    console.log("Raw cookie:", tokenCookie);
    console.log("Token value:", token);
    console.log("Token type:", typeof token);
    console.log("Token length:", token?.length);
    
    const path = req.nextUrl.pathname;
    let isValid = false;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            console.log("JWT payload:", payload);


            isValid = true;
        } catch (error) {
            console.log("Invalid token: ", error);
            // NextResponse.next();
            const response  = NextResponse.redirect(new URL("/login", req.url));

            response.cookies.delete('token');
            return response;
            
        }
    }

        
    if (!isValid && matchesRoutes(path, protectedRoutes)) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isValid && matchesRoutes(path, publicAuthRoutes)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }


    return NextResponse.next();
}


// export const config = {
//   matcher: ["/home/:path*", "/profile/:path*", "/game/:path*", "/chat/:path*", "/settings/:path*"],
// };