import {NextRequest, NextResponse} from "next/server";
import {readOne} from "@/lib/db/mongoHelpers";
import {UserDocument} from "@/lib/db/collections";
import {refreshToken} from "@/lib/authEveOnline";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const characterCookie = request.cookies.get('character')?.value;
  const token = request.cookies.get( 'token' )?.value;

  if ( !characterCookie ) {
    if ( pathname.startsWith( '/api' ) ) {
      return NextResponse.json( { error: 'Unauthorized Request' }, { status: 401 } );
    }

    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  const response = NextResponse.next();
  // if ( ! token ) {
  //   // user is logged in, get refresh token
  //   const [playerName, playerId] = characterCookie.split('|');
  //   const user = await readOne<UserDocument>('eveUsers', { playerId } );
  //   const {access_token, decodedToken} = await refreshToken( user.refreshToken );
  //   response.cookies.set('token', access_token, {
  //     secure: 'production' === process.env.NODE_ENV,
  //     expires: new Date(decodedToken.exp * 1000),
  //     httpOnly: true,
  //     path: '/',
  //     sameSite: 'lax',
  //   })
  // }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/market/:path*', '/api/eve/:path*'],
};
