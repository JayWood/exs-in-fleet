import {NextRequest, NextResponse} from "next/server";
import {readMany} from "@/lib/db/mongoHelpers";
import {MarketCache, MarketCacheDocument} from "@/types/collections";
import {WithId} from "mongodb";

// Mock function to simulate retrieving marketCache data for a structure ID
async function getMarketCacheByStructureId(structureId: string): Promise<MarketCacheDocument[]> {
  // Replace with actual logic to fetch data
  const documents: MarketCacheDocument[] = await readMany( 'marketCache', { structureId } )
  return documents;
}

// Function to calculate and filter profitable items
function getProfitableItems(sourceItems: MarketCacheDocument[], targetItems: MarketCacheDocument[]) {
  const profitableItems = sourceItems
    .map((sourceItem: WithId<MarketCache>) => {
      const targetItem: WithId<MarketCache> = targetItems.find( ( t: WithId<MarketCache>) => t.typeId === sourceItem.typeId );

      // If no target item is available for arbitrage, then bail.
      if ( ! targetItem || ! parseInt(targetItem.buy.volume) || ! parseInt(targetItem.sell.volume) ) return null;

      const sourceMinBuy = parseInt(sourceItem.buy.min);
      const sourceMinSell = parseInt(sourceItem.sell.min);
      const targetMinBuy = parseInt(targetItem.buy.min);
      const targetMinSell = parseInt(targetItem.sell.min);
      const profit = targetMinBuy - sourceMinSell;

      if ( profit <= 0 ) return null;

      return {
        source: sourceItem.typeId,
        target: targetItem.typeId,
        sourceMinBuy,
        sourceMinSell,
        targetMinBuy,
        targetMinSell,
        sourceVolume: parseInt(sourceItem.buy.volume),
        targetVolume: parseInt(targetItem.buy.volume),
        profit: targetMinBuy - sourceMinSell,
      }
    })
    .filter(Boolean);

  return profitableItems;
}

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url)
  const sourceId = searchParams.get('source')
  const targetId = searchParams.get('target')

  if (!sourceId || !targetId) {
    console.error('Source or target ID is missing');
    return;
  }

  const sourceItems = await getMarketCacheByStructureId(sourceId);
  const targetItems = await getMarketCacheByStructureId(targetId);
  const profitableItems = getProfitableItems(sourceItems, targetItems);

  return NextResponse.json(profitableItems);
}