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
    const typeIds = searchParams.get('typeIds')?.toString()

    if (search) {
        return NextResponse.json( await searchByName( search ) );
    }

    if (groupId) {
        return NextResponse.json( await searchByMarketGroupID( Number( groupId ) ) );
    }

    if (typeIds && typeIds.length > 0 && typeIds.includes(',')) {
        const typeIdsArray = typeIds.split(',').map(Number);
        const filter: Filter<InvType> = {typeID: { $in: typeIdsArray }}
        return NextResponse.json(await readMany( 'invTypes', filter ) );
    }

    return NextResponse.json(
        { error: 'Missing required query param: [s] or [group]' },
        { status: 400 }
    )
}
