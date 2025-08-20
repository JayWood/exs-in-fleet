import {NextRequest, NextResponse} from 'next/server';
import {AggregatedOrders, marketCacheGet, marketCacheSet} from "@/lib/market";
import {MarketCache, MarketCacheInsert} from "@/lib/db/collections";

const marketUrl = 'https://market.fuzzwork.co.uk/aggregates/'
export const fuzzworkStructures = [
    {
        station: 60003760,
        name: 'Jita',
    },
    {
        station: 60008494,
        name: 'Amarr',
    },
    {
        station: 60011866,
        name: 'Dodixie',
    },
    {
        station: 60004588,
        name: 'Rens',
    },
    {
        station: 60005686,
        name: 'Hek',
    },
];


export async function getFuzzworksData(stationId: string, typeIds: string) {
    const rows = await marketCacheGet({
        structureId: parseInt(stationId),
        typeId: {$in: typeIds.split(',').map(id => parseInt(id))}
    });
    if (rows && rows.length > 0) {
        console.info('Cache hit - returning market stats from database');
        const aggregated = rows.reduce((acc, row) => {
            const {typeId, buy, sell, structureId, ...rest} = row as MarketCache;
            acc[typeId] = {buy, sell, structureId};
            return acc;
        }, {} as AggregatedOrders)
        return NextResponse.json(aggregated);
    }

    console.info('Cache miss - fetching market stats from API...');
    const response = await fetch(`${marketUrl}?station=${stationId}&types=${typeIds}`);
    const data = await response.json() as AggregatedOrders[];
    const documents = Object.entries(data).map(([typeId, stats]) => ({
        ...stats as AggregatedOrders[number],
        typeId: parseInt(typeId),
        createdAt: new Date(),
        structureId: parseInt(stationId)
    }));
    await marketCacheSet(documents);

    return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const typeIds = searchParams.get('types');
        const stationId = searchParams.get('station');

        if (!stationId || !fuzzworkStructures.some(structure => structure.station.toString() === stationId)) {
            return NextResponse.json({error: 'Invalid station ID'}, {status: 400});
        }

        if (!typeIds) {
            return NextResponse.json({error: 'TypeIds parameter is required'}, {status: 400});
        }

        return await getFuzzworksData(stationId, typeIds);
    } catch (error) {
        console.error('Fuzzworks API Error:', error);
        return NextResponse.json(
            {error: error instanceof Error ? error.message : 'Failed to fetch market data'},
            {status: 500}
        );
    }
}
