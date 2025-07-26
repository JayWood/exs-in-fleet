import {NextRequest, NextResponse} from "next/server";

export async function POST( nextRequest: NextRequest ) {
    return NextResponse.json( 'success' );
}