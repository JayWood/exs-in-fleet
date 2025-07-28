import {NextRequest, NextResponse} from "next/server";
import {getCurrentUserId} from "@/lib/shared";
import {UserSettings} from "@/lib/db/collections";
import {updateOne} from "@/lib/db/mongoHelpers";

export async function POST( nextRequest: NextRequest ) {
    const playerId = getCurrentUserId( nextRequest );
    const payload = await nextRequest.json() as UserSettings;
    console.log( payload, playerId );
    await updateOne('eveUsers', {playerId}, {settings: {structures: payload}}, {upsert: true});
    
    return NextResponse.json( 'success' );
}