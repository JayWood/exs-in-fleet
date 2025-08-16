import {NextRequest, NextResponse} from "next/server";
import {PriceData} from "@/components/client/PriceComparison/PriceComparison";
import {getPriceComparison} from "@/app/api/market/comparisons/route";
import {readMany} from "@/lib/db/mongoHelpers";
import {getMarketGroupTree} from "@/lib/db/market";

export async function GET( request: NextRequest ): Promise<NextResponse> {
    return NextResponse.json( await getMarketGroupTree() );
}
