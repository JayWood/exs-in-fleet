import {CorporationWallet, CorporationWalletJournalEntry, CorporationWalletTransaction} from "@/types/esi/Wallet";
import {NextRequest, NextResponse} from "next/server";
import {MarketOrder} from "@/types/esi/Markets";

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
}
