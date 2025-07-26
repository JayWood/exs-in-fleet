/**
 * EveOnline authentication flow.
 */
import axios from 'axios'
import * as jose from 'jose'
import {updateUser} from "@/lib/db/user";

const CLIENT_ID: string = process?.env?.EVE_CLIENT_ID || ''
const CLIENT_SECRET: string = process?.env?.EVE_CLIENT_SECRET || ''
const EVE_CALLBACK_URL: string = process?.env?.EVE_CALLBACK_URL || ''

const OAUTH_URL = 'https://login.eveonline.com/v2/oauth/'
const AUTH_URL = OAUTH_URL + 'authorize/'
const TOKEN_URL = OAUTH_URL + 'token/'

export type CodeResponse = {
    access_token: string
    expires_in: number
    token_type: string
    refresh_token: string
}

export type UserRecord = {
    access_token: string
    expiration: number
    name: string
    playerId: number
    refresh_token: string
}

export type EvePayload = {
    scp: string[]
    jti: string
    kid: string
    sub: string
    azp: string
    tenant: string
    tier: string
    region: string
    aud: string
    name: string
    owner: string
    exp: number
    iat: number
    iss: string
}

const oAuthScopes = [
    'esi-wallet.read_character_wallet.v1',
    'esi-wallet.read_corporation_wallet.v1',
    'esi-assets.read_assets.v1',
    'esi-markets.structure_markets.v1',
    'esi-markets.read_character_orders.v1',
    'esi-wallet.read_corporation_wallets.v1',
    'esi-assets.read_corporation_assets.v1',
    'esi-markets.read_corporation_orders.v1',
]

/**
 * Just a helper function to get the Login Url
 * @param scopes
 * @param state
 */
export const getEveUrl = (state?: string, scopes?: string[]): string => {
    const url = new URL(AUTH_URL)
    const params: Record<string, string> = {
        response_type: 'code',
        redirect_uri: EVE_CALLBACK_URL,
        client_id: CLIENT_ID,
        scope: scopes ? scopes.join(' ') : oAuthScopes.join(' '),
        state: state ?? 'eve-auth',
    }

    for (const paramsKey in params) {
        url.searchParams.set(paramsKey, params[paramsKey])
    }
    return url.toString()
}

/**
 * Part of the oAuth handshake process.
 * @param authorizationCode
 */
export const exchangeCode = (authorizationCode: string) => {
    const params = {
        grant_type: 'authorization_code',
        code: authorizationCode,
    }

    return axios.post(TOKEN_URL, params, {
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'login.eveonline.com',
        },
    })
}

/**
 * Refreshes a token, revalidates it, and saves it if all is well.
 *
 * @param refresh_token
 */
export const refreshToken = async (refresh_token: string): Promise<{decodedToken: EvePayload, access_token: string}> => {
    const params = {
        grant_type: 'refresh_token',
        refresh_token,
    }

    const { data } = await axios.post(TOKEN_URL, params, {
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'login.eveonline.com',
        },
    })

    const decodedToken = await validateToken(data)

    await updateUser(decodedToken, data.access_token, refresh_token)

    return {decodedToken, access_token: data.access_token};
}

/**
 * Validates the Access token using decryption to ensure authenticity.
 *
 * @param response
 */
export const validateToken = async (
    response: CodeResponse
): Promise<EvePayload> => {
    const { access_token } = response
    return await validateAccessToken(access_token)
}

export const validateAccessToken = async (
    access_token: string
): Promise<EvePayload> => {
    const JWKS = jose.createRemoteJWKSet(
        new URL('https://login.eveonline.com/oauth/jwks')
    )

    const { payload } = await jose
        .jwtVerify(access_token, JWKS, {
            audience: 'EVE Online',
            issuer: ['https://login.eveonline.com', 'login.eveonline.com'],
        })
        .catch((error) => {
            throw error
        })

    return payload as EvePayload
}
