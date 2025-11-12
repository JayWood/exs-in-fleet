import {
  CorporationWallet,
  CorporationWalletJournalEntry,
  CorporationWalletTransaction
} from '@/types/esi/Wallet'
import { NextRequest, NextResponse } from 'next/server'
import {
  CorporationMarketOrder,
  HistoricalCorporationMarketOrder,
  MarketOrder
} from '@/types/esi/Markets'
import {
  AggregatedOrders,
  groupAndAggregate,
  marketCacheGet,
  marketCacheSet
} from '@/lib/market'
import {
  MarketCache,
  MarketCacheDocument,
  MarketCacheInsert,
  UserDocument
} from '@/lib/db/collections'
import { refreshToken } from '@/lib/authEveOnline'
import { readOne } from '@/lib/db/mongoHelpers'
import { tradeStations } from '@/lib/shared'

export class Client {
  private baseUrl: string = 'https://esi.evetech.net/latest'
  private nextRequest: NextRequest
  private allowedHeaders: string[] = [
    'cache-control',
    'etag',
    'expires',
    'last-modified',
    'x-pages'
  ]

  constructor(request: NextRequest) {
    this.nextRequest = request
  }

  /**
   * Public request method for API operations.
   *
   * @param path
   * @param options
   */
  pubRequest<T>(
    path: string,
    options: RequestInit | undefined
  ): Promise<NextResponse<T>> {
    return this.request(path, options)
  }

  /**
   * Authenticated request method for API operations.
   *
   * This method will automatically add the Authorization header with the Bearer token from the cookie.
   *
   * @param path
   * @param options
   */
  async authRequest<T>(
    path: string,
    options: RequestInit | undefined = {}
  ): Promise<NextResponse<T>> {
    const characterData = this.nextRequest.cookies.get('character')?.value
    if (!characterData) {
      throw new Error('Not logged in.')
    }

    const [name, playerId] = characterData.split('|')
    const userDocument = await readOne<UserDocument>('eveUsers', {
      playerId: parseInt(playerId)
    })
    const { access_token } = await refreshToken(userDocument.refresh_token)
    return this.request(path, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${access_token}` }
    })
  }

  corporationOrders(
    corpId: string,
    endpoint: 'orders'
  ): Promise<NextResponse<CorporationMarketOrder[]>>
  corporationOrders(
    corpId: string,
    endpoint: 'orders/history'
  ): Promise<NextResponse<HistoricalCorporationMarketOrder[]>>
  corporationOrders(
    corpId: string,
    endpoint: string
  ): Promise<
    NextResponse<CorporationMarketOrder[] | HistoricalCorporationMarketOrder[]>
  > {
    let path = `/corporations/${corpId}/${endpoint}`
    return this.authRequest<
      CorporationMarketOrder[] | HistoricalCorporationMarketOrder[]
    >(path)
  }

  // Corporation overloads
  corporationWallets(
    corpId: string,
    endpoint: 'wallets'
  ): Promise<NextResponse<CorporationWallet[]>>
  corporationWallets(
    corpId: string,
    endpoint: 'wallets',
    division: string,
    type: 'journal'
  ): Promise<NextResponse<CorporationWalletJournalEntry[]>>
  corporationWallets(
    corpId: string,
    endpoint: 'wallets',
    division: string,
    type: 'transactions'
  ): Promise<NextResponse<CorporationWalletTransaction[]>>
  async corporationWallets(
    corpId: string,
    endpoint?: string,
    division?: string,
    type?: string
  ): Promise<
    NextResponse<
      | CorporationWallet[]
      | CorporationWalletJournalEntry[]
      | CorporationWalletTransaction[]
    >
  > {
    let path = `/corporations/${corpId}`

    if (endpoint === 'wallets') {
      path += '/wallets'
      if (division && type) {
        path += `/${division}/${type}`
      }
    }

    return this.authRequest<
      | CorporationWallet[]
      | CorporationWalletJournalEntry[]
      | CorporationWalletTransaction[]
    >(path)
  }

  // Market Overloads
  markets(
    endpoint: 'structures',
    structureId: string
  ): Promise<NextResponse<MarketOrder[]>>
  async markets(
    endpoint: string,
    structureId: string
  ): Promise<NextResponse<MarketOrder[]>> {
    const path = `/markets/${endpoint}/${structureId}`
    return this.authRequest<MarketOrder[]>(path)
  }

  /**
   * Sends a request to the ESI endpoint while retaining search params and passing headers back through.
   *
   * @param endpoint
   * @param options
   * @private
   */
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = new URL(endpoint, this.baseUrl)
    const originalParams = this.nextRequest.nextUrl.searchParams
    originalParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(
        `ESI request failed: ${response.status} ${response.statusText}`
      )
    }

    const responseJson = await response.json()
    const nextResponse = NextResponse.json(responseJson)
    response.headers.forEach((value, key) => {
      if (
        this.allowedHeaders.includes(key.toLowerCase()) ||
        key.toLowerCase().startsWith('x-esi-')
      ) {
        nextResponse.headers.set(key, value)
      }
    })

    return nextResponse
  }

  /**
   * Recursively fetch all market orders for a given structure.
   *
   * @param endpoint
   * @param structure
   * @param page
   * @param allOrders
   * @private
   */
  private async fetchAllMarketOrders(
    endpoint: string,
    structure: string,
    page = 1,
    allOrders: MarketOrder[] = []
  ): Promise<MarketOrder[]> {
    let res: NextResponse<MarketOrder[]>

    if (endpoint === 'tradeStation' && structure in tradeStations) {
      res = await this.authRequest<MarketOrder[]>(
        `/markets/${tradeStations[structure].region_id}/orders?page=${page}`
      )
    } else {
      res = await this.markets('structures', structure + `/?page=${page}`)
    }

    const data = (await res.json()) as MarketOrder[]

    const totalPages = parseInt(res.headers.get('x-pages') || '1')
    console.info(`Fetching market orders - Page ${page}/${totalPages}...`)
    const combined = [
      ...allOrders,
      ...data.filter(
        i => i.location_id === tradeStations[structure].location_id
      )
    ]
    console.info(`Fetched ${combined.length} orders`)

    if (page < totalPages) {
      return this.fetchAllMarketOrders(endpoint, structure, page + 1, combined)
    } else {
      return combined
    }
  }

  async getAggregatedMarketStats(
    endpoint: string,
    structureId: string
  ): Promise<NextResponse<AggregatedOrders>> {
    console.info('Checking database cache for market stats...')
    const rows = await marketCacheGet({ structureId: parseInt(structureId) })
    if (!rows || rows.length === 0) {
      console.info('Cache miss - fetching market stats from API...')
      const allOrders = await this.fetchAllMarketOrders(endpoint, structureId)
      const result = groupAndAggregate(allOrders, structureId)
      const jsonData = await result.json()
      const documents = Object.entries(jsonData).map(([typeId, stats]) => ({
        ...(stats as AggregatedOrders[number]),
        typeId: parseInt(typeId),
        createdAt: new Date(),
        structureId: structureId
      }))

      await marketCacheSet(documents)
      return NextResponse.json(jsonData)
    }

    console.info('Cache hit - returning market stats from database')
    const aggregated = rows.reduce((acc, row) => {
      const { typeId, buy, sell, structureId } = row as MarketCache
      acc[typeId] = { buy, sell, structureId }
      return acc
    }, {} as AggregatedOrders)

    return NextResponse.json(aggregated)
  }
}
