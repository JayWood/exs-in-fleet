import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/shared'
import { Ajv } from 'ajv'
import { PriceComparisonType, UserDocument } from '@/lib/db/collections'
import { readOne, updateOne } from '@/lib/db/mongoHelpers'

export const priceComparisonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    id: { type: 'string' },
    source: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string' }
      },
      required: ['name', 'id']
    },
    target: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string' }
      },
      required: ['name', 'id']
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          typeId: { type: 'number' },
          name: { type: 'string' }
        }
      }
    }
  },
  required: ['title', 'source', 'target', 'items'],
  additionalProperties: false
}

/**
 * Create a new price comparison.
 *
 * @param nextRequest
 */
export async function POST(nextRequest: NextRequest) {
  const payload: PriceComparisonType = await nextRequest.json()
  const playerId = getCurrentUserId(nextRequest)

  const ajv = new Ajv()
  const validate = ajv.compile(priceComparisonSchema)
  if (!validate(payload)) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  if (payload.id) {
    return new NextResponse(
      JSON.stringify({ error: 'Incompatible method with id present. ' }),
      {
        status: 405,
        headers: {
          Allow: 'PUT, PATCH',
          'Content-Type': 'application/json'
        }
      }
    )
  }

  const playerDocument: UserDocument | null = await readOne<UserDocument>(
    'eveUsers',
    { playerId }
  )
  if (!playerDocument) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const { settings } = playerDocument
  const result = await updateOne<UserDocument>(
    'eveUsers',
    { playerId },
    {
      settings: {
        ...settings,
        priceComparisons: [
          ...settings?.priceComparisons,
          { ...payload, id: crypto.randomUUID() }
        ]
      }
    },
    { upsert: true }
  )

  return NextResponse.json(result)
}

/**
 * Get a price comparison.
 *
 * @param nextRequest
 */
export async function GET(nextRequest: NextRequest) {
  const payload: PriceComparisonType = await nextRequest.json()
  const playerId = getCurrentUserId(nextRequest)
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  }

  const ajv = new Ajv()
  const validate = ajv.compile(updatedSchema)
  if (!validate(payload)) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Not Implemented' }, { status: 501 })
}

/**
 * Replace an existing price comparison, creating it if it doesn't exist.
 *
 * @param nextRequest
 */
export async function PUT(nextRequest: NextRequest) {
  const payload: PriceComparisonType = await nextRequest.json()
  const playerId = getCurrentUserId(nextRequest)
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['title', 'source', 'target', 'items', 'id']
  }

  const ajv = new Ajv()
  const validate = ajv.compile(updatedSchema)
  if (!validate(payload)) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const playerDocument: UserDocument | null = await readOne<UserDocument>(
    'eveUsers',
    { playerId }
  )
  if (!playerDocument) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const { settings } = playerDocument
  if (!settings?.priceComparisons || settings?.priceComparisons.length === 0) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  }

  const priceComparisonIndex = settings.priceComparisons.findIndex(
    (pc: PriceComparisonType) => pc.id === payload.id
  )
  if (priceComparisonIndex) {
    const updatedPriceComparisons = [...settings.priceComparisons]
    updatedPriceComparisons[priceComparisonIndex] = payload

    const result = await updateOne<UserDocument>(
      'eveUsers',
      { playerId },
      {
        settings: {
          ...settings,
          priceComparisons: updatedPriceComparisons
        }
      },
      { upsert: true }
    )

    return NextResponse.json(result)
  }

  const result = await updateOne<UserDocument>(
    'eveUsers',
    { playerId },
    {
      settings: {
        ...settings,
        priceComparisons: [...settings?.priceComparisons, { ...payload }]
      }
    },
    { upsert: true }
  )

  return NextResponse.json(result)
}

/**
 * Delete a price comparison.
 *
 * @param nextRequest
 */
export async function DELETE(nextRequest: NextRequest) {
  const payload: PriceComparisonType = await nextRequest.json()
  const playerId = getCurrentUserId(nextRequest)
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  }

  const ajv = new Ajv()
  const validate = ajv.compile(updatedSchema)
  if (!validate(payload)) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const playerDocument: UserDocument | null = await readOne<UserDocument>(
    'eveUsers',
    { playerId }
  )
  if (!playerDocument) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  const { settings } = playerDocument
  if (!settings?.priceComparisons || settings?.priceComparisons.length === 0) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  }

  const filteredPriceComparisons = settings.priceComparisons.filter(
    (pc: PriceComparisonType) => pc.id !== payload.id
  )

  const result = await updateOne<UserDocument>(
    'eveUsers',
    { playerId },
    {
      settings: {
        ...settings,
        priceComparisons: filteredPriceComparisons
      }
    },
    { upsert: true }
  )

  return NextResponse.json(result)
}

/**
 * Update a price comparison.
 *
 * @param nextRequest
 */
export async function PATCH(nextRequest: NextRequest) {
  const payload: PriceComparisonType = await nextRequest.json()
  const playerId = getCurrentUserId(nextRequest)
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  }

  const ajv = new Ajv()
  const validate = ajv.compile(updatedSchema)
  if (!validate(payload)) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Not Implemented' }, { status: 501 })
}
