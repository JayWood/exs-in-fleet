import { NextRequest, NextResponse } from 'next/server'
import { getEveUrl, exchangeCode, validateToken } from '@/lib/authEveOnline'
import { updateUser } from '@/lib/db/user'

type queryParams = {
  params: Promise<{ type: 'login' | 'callback' | 'testing' }>
}

type eveState = {
  reqType: 'login' | 'addCharacter'
  redirectTo: string
  nonce: string
}

const encode = (jsonObject: object): string => {
  return Buffer.from(JSON.stringify(jsonObject)).toString('base64')
}

const decode = <T>(encodedString: string): T => {
  return JSON.parse(Buffer.from(encodedString, 'base64').toString())
}

/**
 * Logs the user in based on the request data if possible.
 * @param request
 * @param state
 *
 */
const processLoginRequest = async (request: NextRequest, state: eveState) => {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const result = await exchangeCode(code)
  const responseData = result.data
  const decodedToken = await validateToken(responseData)

  // @TODO: get the primary character ID and set that player data as the token if possible instead.

  await updateUser(
    decodedToken,
    responseData.access_token,
    responseData.refresh_token
  )

  const response = NextResponse.redirect(new URL(state.redirectTo, request.url))
  const playerId = decodedToken.sub.split(':')[2]

  response.cookies.set('token', responseData.access_token, {
    secure: 'production' === process.env.NODE_ENV,
    expires: new Date(decodedToken.exp * 1000),
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  })

  response.cookies.set('character', `${decodedToken.name}|${playerId}`, {
    secure: 'production' === process.env.NODE_ENV,
    expires: new Date().getTime() + 60 * 60 * 3 * 1000,
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  })

  return response
}

/**
 * Adds a character to the currently logged in character's roster.
 * @param request
 * @param state
 */
const addCharacter = async (request: NextRequest, state: eveState) => {
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

export async function GET(request: NextRequest, { params }: queryParams) {
  const { type } = await params
  const state = request.nextUrl?.searchParams?.get('state')
  const redirectTo = request.nextUrl?.searchParams?.get('redirectTo')

  if (!['callback', 'login'].includes(type)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  if ('login' === type) {
    // Pseudocode for generating and storing the state
    const stateObj: eveState = {
      reqType: 'login',
      redirectTo: redirectTo || '/admin',
      nonce: crypto.randomUUID()
    }

    // Serialize and encode it
    const state = encode(stateObj)
    const response = NextResponse.redirect(getEveUrl(state))

    response.cookies.set('oauth_state_nonce', stateObj.nonce, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 300
    })

    return response
  }

  if (!state) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const decodedState = decode<eveState>(state)
  const expectedNonce = request.cookies.get('oauth_state_nonce')?.value

  if (!expectedNonce || decodedState.nonce !== expectedNonce) {
    return NextResponse.json(
      { error: 'Invalid or mismatched state' },
      { status: 403 }
    )
  }

  switch (decodedState?.reqType) {
    case 'login':
      return await processLoginRequest(request, decodedState)
    case 'addCharacter':
      return await addCharacter(request, decodedState)
    default:
      return NextResponse.json({ error: 'Not Authorized' }, { status: 401 })
  }
}
