// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to /login
  if (!token) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/users/:path*',
    '/students/:path*',
    '/teachers/:path*',
    '/departments/:path*',
    '/resources/:path*',
  ],
};
