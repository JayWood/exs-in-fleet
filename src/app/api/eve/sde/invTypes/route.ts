import {NextRequest, NextResponse} from "next/server";
import {readMany} from "@/lib/db/mongoHelpers";
import {InvType} from "@/lib/db/collections";
import {Filter} from "mongodb";

const searchByName = async ( search: string ) => {
    const filter: Filter<InvType> = {marketGroupID: { $ne: "None" }, typeName: { $regex: search, $options: 'i' }}
    return readMany( 'invTypes', filter );
}

const searchByMarketGroupID = async ( search: number ) => {
    const filter: Filter<InvType> = {marketGroupID: search}
    return readMany( 'invTypes', filter );
};

export async function GET( request: NextRequest ): Promise<NextResponse> {
    const {searchParams} = new URL( request.url );
    const search = searchParams.get('s')?.toString()
    const groupId = searchParams.get('marketGroupID')?.toString()
    let data = null;

    if (search && groupId) {
        return NextResponse.json(
            { error: 'Only one of [s] or [group] may be used at a time.' },
            { status: 400 }
        )
    }

    if (search) {
        data = await searchByName( search );
    } else if (groupId) {
        data = await searchByMarketGroupID( Number( groupId ) )
    } else {
        return NextResponse.json(
            { error: 'Missing required query param: [s] or [group]' },
            { status: 400 }
        )
    }

    return NextResponse.json(data)
}