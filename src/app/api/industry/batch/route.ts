import { JSONSchemaType } from 'ajv'
import { BatchType } from '@/lib/db/collections'

export const batchSchema: JSONSchemaType<BatchType> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    status: {
      type: 'string',
      enum: ['planned', 'in_progress', 'completed', 'canceled'],
      nullable: true
    },
    created_at: { type: 'string', format: 'date-time', nullable: true },
    started_at: { type: 'string', format: 'date-time', nullable: true },
    completed_at: { type: 'string', format: 'date-time', nullable: true },

    costs: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      properties: {
        materials: { type: 'number', nullable: true },
        job_fee: { type: 'number', nullable: true },
        taxes: { type: 'number', nullable: true },
        broker_fee: { type: 'number', nullable: true },
        scc_surcharge: { type: 'number', nullable: true },
        total: { type: 'number', nullable: true }
      },
      required: []
    },

    products: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type_id: { type: 'number' },
          name: { type: 'string' },
          me: { type: 'number', nullable: true },
          runs: { type: 'number' },
          quantity_per_run: { type: 'number', nullable: true },
          total_quantity: { type: 'number', nullable: true },
          estimated_unit_price: { type: 'number', nullable: true }
        },
        required: ['type_id', 'name', 'runs']
      }
    },

    market_orders: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          order_id: { type: 'number' },
          type_id: { type: 'number' },
          location_id: { type: 'number', nullable: true },
          quantity: { type: 'number' },
          price: { type: 'number' },
          total: { type: 'number' },
          issued_at: { type: 'string', format: 'date-time', nullable: true },
          is_sold: { type: 'boolean', nullable: true }
        },
        required: ['order_id', 'type_id', 'quantity', 'price', 'total']
      },
      nullable: true
    },

    revenue: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      properties: {
        expected: { type: 'number', nullable: true },
        actual: { type: 'number', nullable: true }
      },
      required: []
    },

    profit: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      properties: {
        expected: { type: 'number', nullable: true },
        actual: { type: 'number', nullable: true }
      },
      required: []
    },

    owner_id: { type: 'string', nullable: true }, // Mongo ObjectId as string
    notes: { type: 'string', nullable: true }
  },
  required: ['name', 'products']
}

export default function GET() {}
