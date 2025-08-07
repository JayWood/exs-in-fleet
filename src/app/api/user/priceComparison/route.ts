import {NextRequest, NextResponse} from "next/server";
import {getCurrentUserId} from "@/lib/shared";
import {Ajv, JSONSchemaType} from "ajv";
import {PriceComparisonType, UserSettings} from "@/lib/db/collections";

type queryParams = {
  params: Promise<{action: string}>;
}

export const priceComparisonSchema = {
  type: 'object',
  properties: {
    title: {type: 'string'},
    id: {type: 'string'},
    source: {
      type: 'object',
      properties: {
        name: {type: 'string'},
        id: {type: 'string'}
      },
      required: ['name', 'id']
    },
    target: {
      type: 'object',
      properties: {
        name: {type: 'string'},
        id: {type: 'string'}
      },
      required: ['name', 'id']
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          typeId: {type: 'number'},
          name: {type: 'string'}
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
export async function POST ( nextRequest: NextRequest ) {
  const payload: PriceComparisonType = await nextRequest.json();
  const playerId = getCurrentUserId(nextRequest);

  const ajv = new Ajv();
  const validate = ajv.compile(priceComparisonSchema);
  if ( ! validate(payload) ) {
    return NextResponse.json({error: 'Bad Request'}, {status: 400});
  }

  if ( payload.id ) {
    return new NextResponse(
      JSON.stringify({ error: 'Incompatible method with id present. ' }),
      {
        status: 405,
        headers: {
          'Allow': 'PUT, PATCH',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Get a price comparison.
 *
 * @param nextRequest
 */
export async function GET ( nextRequest: NextRequest ) {
  const payload: PriceComparisonType = await nextRequest.json();
  const playerId = getCurrentUserId(nextRequest);
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  }

  const ajv = new Ajv();
  const validate = ajv.compile(updatedSchema);
  if ( ! validate(payload) ) {
    return NextResponse.json({error: 'Bad Request'}, {status: 400});
  }
}

/**
 * Replace an existing price comparison, creating it if it doesn't exist.
 *
 * @param nextRequest
 */
export async function PUT ( nextRequest: NextRequest ) {
  const payload: PriceComparisonType = await nextRequest.json();
  const playerId = getCurrentUserId(nextRequest);
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['title', 'source', 'target', 'items', 'id']
  };

  const ajv = new Ajv();
  const validate = ajv.compile(updatedSchema);
  if ( ! validate(payload) ) {
    return NextResponse.json({error: 'Bad Request'}, {status: 400});
  }
}

/**
 * Delete a price comparison.
 *
 * @param nextRequest
 */
export async function DELETE ( nextRequest: NextRequest ) {
  const payload: PriceComparisonType = await nextRequest.json();
  const playerId = getCurrentUserId(nextRequest);
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  };

  const ajv = new Ajv();
  const validate = ajv.compile(updatedSchema);
  if ( ! validate(payload) ) {
    return NextResponse.json({error: 'Bad Request'}, {status: 400});
  }
}

/**
 * Update a price comparison.
 *
 * @param nextRequest
 */
export async function PATCH ( nextRequest: NextRequest ) {
  const payload: PriceComparisonType = await nextRequest.json();
  const playerId = getCurrentUserId(nextRequest);
  const updatedSchema = {
    ...priceComparisonSchema,
    required: ['id']
  }

  const ajv = new Ajv();
  const validate = ajv.compile(updatedSchema);
  if ( ! validate(payload) ) {
    return NextResponse.json({error: 'Bad Request'}, {status: 400});
  }
}

/**
 * Get the allowed methods for a price comparison.
 *
 * @param nextRequest
 */
export async function OPTIONS ( nextRequest: NextRequest ) {

}
