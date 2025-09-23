import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicAuthRoutes = ["/login", "/signup"];
const protectedRoutes = ["/home", "/profile", "/game", "/chat", "/settings"];


function matchesRoutes(path: string, routes: string[]) {
    return routes.some(r => path === r || path.startsWith(r + "/"));
}

export default function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    const path = req.nextUrl.pathname;
    // const isProtectedRoute = protectedRoutes.includes(path);
    // const isPublicAuthRoute = publicAuthRoutes.includes(path);
    
    // if (!token && protectedRoutes.some(r => path.startsWith(r))) {
    //     return NextResponse.redirect(new URL('/login', req.url))
    // }
    // if (token && publicAuthRoutes.some(r => path.startsWith(r))) {
    //     return NextResponse.redirect(new URL('/home', req.url));
    // }

    // console.log("-------- {Middleware triggered: ", { path, token });

        console.log("Middleware triggered", {
    path,
    token,
    isProtected: matchesRoutes(path, protectedRoutes),
    isPublic: matchesRoutes(path, publicAuthRoutes)
    });


        
    if (!token && matchesRoutes(path, protectedRoutes)) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (token && matchesRoutes(path, publicAuthRoutes)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }


    return NextResponse.next();
}


// export const config = {
//   matcher: ["/home/:path*", "/profile/:path*", "/game/:path*", "/chat/:path*", "/settings/:path*"],
// };