import { NextRequest, NextResponse } from 'next/server'
import { redirect, useSearchParams } from 'next/navigation'
import { getEveUrl, exchangeCode, validateToken } from '@/lib/eve-auth'
import { updateUser } from '@/lib/db'

type queryParams = {
  params: Promise<{ type: 'login' | 'callback' | 'testing' }>
}

type eveState = Record<string, any>

const encode = (jsonObject: object): string => {
  return Buffer.from(JSON.stringify(jsonObject)).toString('base64')
}

const decode = (encodedString: string) => {
  return JSON.parse(Buffer.from(encodedString, 'base64').toString())
}

/**
 * Logs the user in based on the request data if possible.
 * @param request
 * @param state
 */
const login = async (request: NextRequest, state?: Record<string, any>) => {
  const result = await exchangeCode(request.nextUrl.searchParams.get('code'))
  const responseData = result.data
  const decodedToken = await validateToken(responseData)

  // @TODO: get the primary character ID and set that player data as the token if possible instead.

  await updateUser(
    decodedToken,
    responseData.access_token,
    responseData.refresh_token
  )

  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  const oneDay = 24 * 60 * 60 * 1000
  const playerId = decodedToken.sub.split(':')[2]

  response.cookies.set('token', responseData.access_token, {
    secure: 'production' === process.env.NODE_ENV,
    expires: Date.now() + oneDay,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })

  response.cookies.set('character', `${decodedToken.name}|${playerId}`, {
    secure: 'production' === process.env.NODE_ENV,
    expires: Date.now() + oneDay,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })

  return response
}

/**
 * Adds a character to the currently logged in character's roster.
 * @param request
 * @param state
 */
const addCharacter = async (
  request: NextRequest,
  state: { reqType: string; redirect: string }
) => {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    // return error
  }

  const eveResponse = await exchangeCode(code)
  const token = await validateToken(eveResponse.data)
  const response = NextResponse.redirect(new URL(state.redirect, request.url))
  const oneDay = 24 * 60 * 60 * 1000

  /*
  get currently logged in player ID
  exchange code for token & validate token
  update user and set player ID to the parent properly
  redirect the user to the redirect value sent in state
   */
}

export async function POST(request: NextRequest, { params }: queryParams) {
  const { type } = await params
  console.log('made it')

  if ('testing' === type) {
    return NextResponse.json('Made it')
  }

  if ('login' !== type) {
    return NextResponse.json({ error: 'Not Found' })
  }

  redirect(
    getEveUrl(
      encode({
        reqType: 'login',
      })
    )
  )
}

export async function GET(request: NextRequest, { params }: queryParams) {
  const { type } = await params
  const state = request.nextUrl?.searchParams?.get('state')
  if ('callback' !== type || !state) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const decodedState = decode(state)

  switch (decodedState?.reqType) {
    case 'login':
      return await login(request, decodedState)
    case 'addCharacter':
      return await addCharacter(request, decodedState)
    default:
      return NextResponse.json(
        { error: 'Not Authorized' },
        { status: 401 }
      )
  }
}
