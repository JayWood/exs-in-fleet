import {NextRequest, NextResponse} from "next/server";
import {readOne} from "@/lib/db/mongoHelpers";
import {UserDocument} from "@/lib/db/collections";
import {refreshToken} from "@/lib/authEveOnline";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const characterCookie = request.cookies.get('character')?.value;

  if ( !characterCookie ) {
    if ( pathname.startsWith( '/api' ) ) {
      return NextResponse.json( { error: 'Unauthorized Request' }, { status: 401 } );
    }

    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/market/:path*', '/api/eve/:path*'],
};
