import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@/lib/esi/Client'

interface RouteConfig {
  pattern: RegExp
  handler: (client: Client, match: RegExpMatchArray) => Promise<any>
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE')[]
}

export class Router {
  private readonly client: Client

  constructor(request: NextRequest) {
    this.client = new Client(request)
  }

  private routes: RouteConfig[] = [
    {
      pattern: /^corporations\/(\d+)\/orders$/,
      handler: async (client, match) => {
        return client.corporationOrders(match[1], 'orders')
      },
      methods: ['GET']
    },
    {
      pattern: /^corporations\/(\d+)\/orders\/history$/,
      handler: async (client, match) => {
        return client.corporationOrders(match[1], 'orders/history')
      },
      methods: ['GET']
    },
    {
      pattern: /^corporations\/(\d+)\/wallets$/,
      handler: async (client, match) => {
        return client.corporationWallets(match[1], 'wallets')
      },
      methods: ['GET']
    },
    {
      pattern: /^corporations\/(\d+)\/wallets\/(\d+)\/journal$/,
      handler: async (client, match) => {
        return client.corporationWallets(
          match[1],
          'wallets',
          match[2],
          'journal'
        )
      },
      methods: ['GET']
    },
    {
      pattern: /^corporations\/(\d+)\/wallets\/(\d+)\/transactions$/,
      handler: async (client, match) => {
        return client.corporationWallets(
          match[1],
          'wallets',
          match[2],
          'transactions'
        )
      },
      methods: ['GET']
    },
    {
      pattern: /^markets\/structures\/(\d+)$/,
      handler: async (client, match) => {
        return client.markets('structures', match[1])
      },
      methods: ['GET']
    },
    {
      pattern: /^markets\/structures\/(\d+)\/aggregate$/,
      handler: async (client, match) => {
        return client.getAggregatedMarketStats('structures', match[1])
      },
      methods: ['GET']
    },
    {
      pattern: /^markets\/stations\/(jita|rens|amarr|hek)\/aggregate$/,
      handler: async (client, match) => {
        return client.getAggregatedMarketStats('tradeStation', match[1])
      },
      methods: ['GET']
    }
  ]

  async dispatch(path: string, method: string) {
    for (const route of this.routes) {
      const match = path.match(route.pattern)
      if (match && route.methods.includes(method as any)) {
        return await route.handler(this.client, match)
      }
    }

    throw new Error(`No route found for ${method} ${path}`)
  }

  // Expose the client for direct usage if needed
  getClient(): Client {
    return this.client
  }
}
