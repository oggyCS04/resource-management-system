import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification (must match backend)
// In production, use process.env.JWT_SECRET
const SECRET_KEY = new TextEncoder().encode("rms_secret_key_change_later");

export async function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Define public routes
    const publicRoutes = ['/login', '/_next', '/favicon.ico', '/public'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Redirect to login if no token
    if (!token) {
        // Check if accessing protected routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/student')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const role = payload.role as string;

        // Role-based access control
        if (pathname.startsWith('/admin') && role.toLowerCase() !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/teacher') && role.toLowerCase() !== 'teacher') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/student') && role.toLowerCase() !== 'student') {
            return NextResponse.redirect(new URL('/', request.url));
        }


        return NextResponse.next();
    } catch (error) {
        // Token verification failed
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}


export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
