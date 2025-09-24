import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicAuthRoutes = ["/login", "/signup"];
const protectedRoutes = ["/home", "/profile", "/game", "/chat", "/settings"];

// ADD ALL routes that involve authentication
const SKIP_MIDDLEWARE_ROUTES = [
  "/api/auth/", // All auth API routes
  "/auth/",     // All auth pages
  "/login",
  "/signup",
  "/oauth/",
  "/callback",  // OAuth callback routes
  "/home"
];

const secret = new TextEncoder().encode('pingpongsupersecretkey');

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  console.log("🔍 Middleware path:", path);
  
  // ⚡ CRITICAL: SKIP middleware for ALL auth-related routes
  if (SKIP_MIDDLEWARE_ROUTES.some(route => path.startsWith(route))) {
    console.log("⏭️ SKIPPING middleware for auth route:", path);
    return NextResponse.next();
  }
  
  // Only run auth logic for non-auth routes
  const token = req.cookies.get('token')?.value;
  console.log("🔐 Token check:", token ? "EXISTS" : "MISSING");
  
  let isValid = false;
  
  if (token) {
    try {
      await jwtVerify(token, secret);
      isValid = true;
      console.log("✅ Valid token");
    } catch (error) {
      console.log("❌ Invalid token");
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('token');
      return response;
    }
  }
  
  // Redirect to login if no token and accessing protected route
  if (!isValid && protectedRoutes.some(route => path.startsWith(route))) {
    console.log("🚫 Redirecting to login");
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Redirect to home if has token and accessing auth page
  if (isValid && publicAuthRoutes.some(route => path.startsWith(route))) {
    console.log("🏠 Redirecting to home");
    return NextResponse.redirect(new URL('/home', req.url));
  }
  
  console.log("✅ Allowing access");
  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    // '/((?!api|_next/static|_next/image|.*\\.png$).*)'
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
