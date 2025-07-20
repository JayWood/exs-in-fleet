import {MarketOrder} from "@/types/esi/Markets";
import {Client} from "@/lib/esi/Client";

async function fetchAllMarketOrders(client: Client, endpoint: string, structureId: string, page = 1, allOrders: MarketOrder[] = []): Promise<MarketOrder[]> {
  const res = await client.markets(endpoint, structureId + `/?page=${page}`);
  const data = await res.json() as MarketOrder[];

  const totalPages = parseInt(res.headers.get('x-pages') || '1');
  const combined = [...allOrders, ...data];

  if (page < totalPages) {
    return fetchAllMarketOrders(client, endpoint, structureId, page + 1, combined);
  } else {
    return combined;
  }
}

type OrderStats = {
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
    buy: OrderStats;
    sell: OrderStats;
  };
};

function calculateStats(orders: MarketOrder[]): OrderStats {
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

function groupAndAggregate(orders: MarketOrder[]): AggregatedOrders {
  const grouped: Record<number, { buy: MarketOrder[]; sell: MarketOrder[] }> = {};

  for (const order of orders) {
    if (!grouped[order.type_id]) {
      grouped[order.type_id] = { buy: [], sell: [] };
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
    result[typeId] = { buy: buyStats, sell: sellStats };
  }

  return result;
}

export async function getAggregatedMarketStats(client: Client, endpoint: string, structureId: string): Promise<AggregatedOrders> {
  const allOrders = await fetchAllMarketOrders(client, endpoint, structureId);
  return groupAndAggregate(allOrders);
}

