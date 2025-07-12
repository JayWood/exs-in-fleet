import {NextRequest, NextResponse} from "next/server";
import {readMany} from "@/lib/db/mongoHelpers";
import {InvType} from "@/lib/db/collections";
import {Filter} from "mongodb";

export async function GET( request: NextRequest ): Promise<NextResponse> {
    const {searchParams} = new URL( request.url );
    const search = searchParams.get('s')?.toString()

    const filter: Filter<InvType> = {marketGroupID: { $ne: "None" }, typeName: { $regex: search, $options: 'i' }}
    const data = await readMany( 'invTypes', filter );

    return NextResponse.json(data)
}