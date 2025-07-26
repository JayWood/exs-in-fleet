import {MarketOrder} from "@/types/esi/Markets";
import {NextResponse} from "next/server";
import {collectionExists, createCollection, createProjection, readMany, writeMany} from "@/lib/db/mongoHelpers";
import {MarketCacheDocument} from "@/lib/db/collections";

export type OrderStats = {
  weightedAverage: string;
  max: string;
  min: string;
  stddev: string;
  median: string;
  volume: string;
  orderCount: string;
  percentile: string; // 95th percentile
};

export type AggregatedOrders = {
  [typeId: number]: {
    structureId?: string;
    buy: OrderStats;
    sell: OrderStats;
  };
};

export function calculateStats(orders: MarketOrder[]): OrderStats {
  if (orders.length === 0) {
    return {
      weightedAverage: "0",
      max: "0",
      min: "0",
      stddev: "0",
      median: "0",
      volume: "0",
      orderCount: "0",
      percentile: "0"
    };
  }

  const prices = orders.map(o => o.price).sort((a, b) => a - b);
  const volumes = orders.map(o => o.volume_remain);
  const totalVolume = volumes.reduce((a, b) => a + b, 0);
  const weightedAverage = orders.reduce((sum, o) => sum + o.price * o.volume_remain, 0) / totalVolume;

  const mean = orders.reduce((sum, o) => sum + o.price, 0) / orders.length;
  const variance = orders.reduce((sum, o) => sum + Math.pow(o.price - mean, 2), 0) / orders.length;
  const stddev = Math.sqrt(variance);

  const percentile95 = prices[Math.floor(prices.length * 0.95)] || prices[prices.length - 1];
  const median = prices[Math.floor(prices.length / 2)];

  return {
    weightedAverage: weightedAverage.toString(),
    max: Math.max(...prices).toString(),
    min: Math.min(...prices).toString(),
    stddev: stddev.toString(),
    median: median.toString(),
    volume: totalVolume.toString(),
    orderCount: orders.length.toString(),
    percentile: percentile95.toString()
  };
}

export function groupAndAggregate(orders: MarketOrder[], structureId: string): NextResponse<AggregatedOrders> {
  const grouped: Record<number, { buy: MarketOrder[]; sell: MarketOrder[] }> = {};

  for (const order of orders) {
    if (!grouped[order.type_id]) {
      grouped[order.type_id] = {buy: [], sell: []};
    }

    if (order.is_buy_order) {
      grouped[order.type_id].buy.push(order);
    } else {
      grouped[order.type_id].sell.push(order);
    }
  }

  const result: AggregatedOrders = {};
  for (const typeId in grouped) {
    const buyStats = calculateStats(grouped[typeId].buy);
    const sellStats = calculateStats(grouped[typeId].sell);
    result[typeId] = {buy: buyStats, sell: sellStats, structureId};
  }

  return NextResponse.json(result);
}

export function marketCacheGet( filter: Record<string, any> = {}, fields?: string[] ): Promise<MarketCacheDocument[]> {
  const projection = fields ? createProjection(fields) : undefined;
  return readMany( 'marketCache', filter, projection );
}

export async function marketCacheSet( documents: AggregatedOrders[] ) {
  if (!await collectionExists('marketCache')) {
    await createCollection('marketCache', [{
      key: {createdAt: 1},
      options: {expireAfterSeconds: 24 * 60 * 60}
    }]);
  }
  return writeMany( 'marketCache', documents );
}
