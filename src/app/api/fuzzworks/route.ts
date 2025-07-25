import {NextRequest, NextResponse} from 'next/server';

const marketUrl = 'https://market.fuzzwork.co.uk/aggregates/?station=60003760'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const typeIds = searchParams.get('types');

        if (!typeIds) {
            return NextResponse.json({error: 'TypeIds parameter is required'}, {status: 400});
        }

        const response = await fetch(`${marketUrl}&types=${typeIds}`);

        if (!response.ok) {
            throw new Error('Failed to fetch market data');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Fuzzworks API Error:', error);
        return NextResponse.json(
            {error: error instanceof Error ? error.message : 'Failed to fetch market data'},
            {status: 500}
        );
    }

    // TODO: cache response data for 24 hours in 'market data' table by source
}