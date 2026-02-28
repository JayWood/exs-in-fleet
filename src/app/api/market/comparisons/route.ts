import {NextRequest, NextResponse} from 'next/server'
import {PriceData} from '@/components/client/PriceComparison/PriceComparison'
import {getFuzzworksData} from '@/app/api/fuzzworks/route'
import {createProjection, readMany, readOne} from '@/lib/db/mongoHelpers'
import {AggregatedOrders} from '@/lib/market'
import {
  InvTypeDocument,
  MarketCache,
  MarketCacheDocument
} from '@/types/collections'
import {tradeStations} from "@/lib/shared";
import Next from "ajv/lib/vocabularies/next";

export type priceCompareParams = {
  sourceSystemId?: number
  targetStructureId?: number
  itemIds?: number[]
}

type MarketOrder = {
  buy: number[]
  sell: number[]
  structureId: number
}

const getStructureAggregatedOrders = async (
  structureId: number,
  typeIds: number[]
): Promise<AggregatedOrders> => {

  // If the structure is a fuzzwork compatible structure, use fuzzworks to gather data.
  if (Object.entries(tradeStations).some(([k, v]) => v.location_id == structureId)) {
    console.log('Fetching from fuzzworks')
    const resp = await getFuzzworksData(
      structureId.toString(),
      typeIds.join(',')
    )
    return resp.json() as Promise<AggregatedOrders>
  }

  const rows = await readMany('marketCache', {
    structureId: structureId.toString(),
    typeId: {$in: typeIds}
  })

  return rows.reduce((aggregatedOrders: AggregatedOrders, row: MarketCacheDocument): AggregatedOrders => {
    const {typeId, buy, sell, structureId} = row
    aggregatedOrders[typeId] = {buy, sell, structureId}
    return aggregatedOrders
  }, {} as AggregatedOrders)
}

const getMinSellPrice = (orders, typeId: number): number => {
  const order = orders[typeId]
  if (!order?.sell?.length) return 0
  return Math.min(...order.sell)
}

const formatPriceData = async (
  sourceOrders: AggregatedOrders,
  targetOrders: AggregatedOrders,
  itemIds: number[]
): Promise<PriceData[]> => {
  const typeMap = await readMany<InvTypeDocument>(
    'invTypes',
    {typeID: {$in: itemIds}},
    createProjection(['typeID', 'typeName'])
  )
  return itemIds.map(
    typeId =>
      ({
        source: sourceOrders[typeId]?.sell?.min || 0,
        target: targetOrders[typeId]?.sell?.min || 0,
        targetStock: targetOrders[typeId]?.sell?.volume || 0,
        item: {
          typeId,
          name: typeMap.find(t => t.typeID === typeId)?.typeName || 'Unknown'
        }
      }) as PriceData
  )
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const {searchParams} = new URL(request.url)
  const sourceId = Number(searchParams.get('source'))
  const targetId = Number(searchParams.get('target'))
  const itemIds =
    searchParams
      .get('itemIds')
      ?.split(',')
      .map(n => Number(n)) || []

  // Optionally validate inputs
  if (isNaN(sourceId) || isNaN(targetId)) {
    return NextResponse.json({error: 'Invalid parameters'}, {status: 400})
  }

  const sourceOrders = await getStructureAggregatedOrders(sourceId, itemIds)
  const targetOrders = await getStructureAggregatedOrders(targetId, itemIds)

  const data: PriceData[] = await formatPriceData(
    sourceOrders,
    targetOrders,
    itemIds
  )
  return NextResponse.json(data)
}
