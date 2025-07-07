import { cookies } from 'next/headers'
import { validateAccessToken } from '@/lib/eve-auth'
import { NextRequest, NextResponse } from 'next/server'

const ESIBase = 'https://esi.evetech.net/'
export const dynamic = 'force-dynamic'

export async function POST(
    request: Request,
    { params }: { params: { esiPath: string[] } }
) {
    const { searchParams } = new URL(request.url)
    const token = cookies().get('token')?.value
    const validToken = await validateAccessToken(token).catch((e) => {
        return false
    })

    if (!validToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }))
    }

    return Response.json(params.esiPath)
}

export async function GET(
    request: NextRequest,
    { params }: { params: { esiPath: string[] } }
) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.toString()
    const token = cookies().get('token')?.value
    const validToken = await validateAccessToken(token).catch((e) => {
        return false
    })

    if (!validToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }))
    }

    return Response.json({
        p: params.esiPath,
        searchParams,
        query,
        x: request.url,
    })
}
