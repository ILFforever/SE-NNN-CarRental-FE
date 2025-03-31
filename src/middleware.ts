import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect booking, myreservations, and account management routes
  matcher: ['/booking/:path*', '/myreservations/:path*', '/account/:path*'],
};