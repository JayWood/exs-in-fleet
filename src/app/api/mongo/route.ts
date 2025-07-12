import {NextRequest, NextResponse} from "next/server";
import {PriceData} from "@/components/client/PriceComparison";
import {getPriceComparison} from "@/app/api/market/priceCompare/route";
import {readMany} from "@/lib/db/mongoHelpers";

export async function GET( request: NextRequest ): Promise<NextResponse> {
    const result = await readMany( 'invTypes', {published: 1});
    return NextResponse.json( result );
}