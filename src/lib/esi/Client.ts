import {CorporationWallet, CorporationWalletJournalEntry, CorporationWalletTransaction} from "@/types/esi/Wallet";
import {NextRequest, NextResponse} from "next/server";
import {MarketOrder} from "@/types/esi/Markets";
import {collectionExists, createCollection, readMany, writeMany} from "@/lib/db/mongoHelpers";

type IndexConfig = {
  key: Record<string, 1 | -1>;
  options?: Record<string, any>;
};

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

export class Client {
  private baseUrl: string = 'https://esi.evetech.net/latest'
  private nextRequest: NextRequest;
  private allowedHeaders: string[] = ['cache-control', 'etag', 'expires', 'last-modified', 'x-pages'];

  constructor(request: NextRequest) {
    this.nextRequest = request;
  }

  /**
   * Public request method for API operations.
   *
   * @param path
   * @param options
   */
  pubRequest<T>(path: string, options: RequestInit | undefined): Promise<NextResponse<T>> {
    return this.request(path, options);
  }

  /**
   * Authenticated request method for API operations.
   *
   * This method will automatically add the Authorization header with the Bearer token from the cookie.
   *
   * @param path
   * @param options
   */
  authRequest<T>(path: string, options: RequestInit | undefined = {}): Promise<NextResponse<T>> {
    const token = this.nextRequest.cookies.get('token')?.value;
    return this.request(path, {...options, headers: {...options?.headers, Authorization: `Bearer ${token}`}});
  }

  // Corporation overloads
  wallet(corpId: string, endpoint: 'wallets'): Promise<NextResponse<CorporationWallet[]>>;
  wallet(corpId: string, endpoint: 'wallets', division: string, type: 'journal'): Promise<NextResponse<CorporationWalletJournalEntry[]>>;
  wallet(corpId: string, endpoint: 'wallets', division: string, type: 'transactions'): Promise<NextResponse<CorporationWalletTransaction[]>>;
  async wallet(
    corpId: string,
    endpoint?: string,
    division?: string,
    type?: string
  ): Promise<NextResponse<CorporationWallet[] | CorporationWalletJournalEntry[] | CorporationWalletTransaction[]>> {
    let path = `/corporations/${corpId}`;

    if (endpoint === 'wallets') {
      path += '/wallets';
      if (division && type) {
        path += `/${division}/${type}`;
      }
    }

    return this.authRequest<CorporationWallet[] | CorporationWalletJournalEntry[] | CorporationWalletTransaction[]>(path);
  }

  // Market Overloads
  markets(endpoint: 'structures', structureId: string): Promise<NextResponse<MarketOrder[]>>;
  async markets(endpoint: string, structureId: string): Promise<NextResponse<MarketOrder[]>> {
    const path = `/markets/${endpoint}/${structureId}`;
    return this.authRequest<MarketOrder[]>(path);
  }

  /**
   * Sends a request to the ESI endpoint while retaining search params and passing headers back through.
   *
   * @param endpoint
   * @param options
   * @private
   */
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = new URL(endpoint, this.baseUrl);
    const originalParams = this.nextRequest.nextUrl.searchParams;
    originalParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`ESI request failed: ${response.status} ${response.statusText}`);
    }

    const responseJson = await response.json();
    const nextResponse = NextResponse.json(responseJson);
    response.headers.forEach((value, key) => {
      if (this.allowedHeaders.includes(key.toLowerCase()) || key.toLowerCase().startsWith('x-esi-')) {
        nextResponse.headers.set(key, value);
      }
    });

    return nextResponse;
  }

  calculateStats(orders: MarketOrder[]): OrderStats {
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

  groupAndAggregate(orders: MarketOrder[]): NextResponse<AggregatedOrders> {
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
      const buyStats = this.calculateStats(grouped[typeId].buy);
      const sellStats = this.calculateStats(grouped[typeId].sell);
      result[typeId] = { buy: buyStats, sell: sellStats };
    }

    return NextResponse.json(result);
  }

  async fetchAllMarketOrders(endpoint: string, structureId: string, page = 1, allOrders: MarketOrder[] = []): Promise<MarketOrder[]> {
    const res = await this.markets('structures', structureId + `/?page=${page}`);
    const data = await res.json() as MarketOrder[];

    console.log(`Fetching market orders - Page ${page}`);

    const totalPages = parseInt(res.headers.get('x-pages') || '1');
    const combined = [...allOrders, ...data];

    if (page < totalPages) {
      return this.fetchAllMarketOrders(endpoint, structureId, page + 1, combined);
    } else {
      return combined;
    }
  }

  async getAggregatedMarketStats(endpoint: string, structureId: string): Promise<NextResponse<AggregatedOrders>> {

    console.log('Checking database cache for market stats...');
    const collection = `market-${endpoint}-${structureId}`;
    if (!await collectionExists(collection)) {
      await createCollection(collection, [{
        key: {createdAt: 1},
        options: {expireAfterSeconds: 24 * 60 * 60}
      }]);
    }

    const rows = await readMany(collection, {});
    if (!rows || rows.length === 0) {
      console.log('Cache miss - fetching market stats from API...');
      const allOrders = await this.fetchAllMarketOrders(endpoint, structureId);
      const result = this.groupAndAggregate(allOrders);
      const jsonData = await result.json();
      const documents = Object.entries(jsonData).map(([typeId, stats]) => ({
        ...stats,
        typeId: parseInt(typeId),
        createdAt: new Date()
      }));
      await writeMany(collection, documents);
      return NextResponse.json(jsonData);
    }

    console.log('Cache hit - returning market stats from database');
    const aggregated = rows.reduce((acc, row) => {
      const {typeId, buy, sell, ...rest} = row;
      acc[typeId] = {buy, sell};
      return acc;
    }, {} as AggregatedOrders);

    return NextResponse.json(aggregated);
  }
}
