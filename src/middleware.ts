import {NextRequest, NextResponse} from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const characterCookie = request.cookies.get('character');

  if ( !characterCookie ) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    if ( pathname.startsWith( '/api' ) ) {
      return NextResponse.json( { error: 'Unauthorized Request' }, { status: 401 } );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/market/:path*', '/api/eve/:path*'],
};
