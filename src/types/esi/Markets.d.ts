export type MarketOrderRange =
  | 'station'
  | 'region'
  | 'solarsystem'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '10'
  | '20'
  | '30'
  | '40'

export interface MarketOrder {
  /** Duration of the order in days */
  duration: number

  /** True if this is a buy order, false if it's a sell order */
  is_buy_order: boolean

  /** ISO 8601 timestamp of when the order was issued */
  issued: string

  /** Location ID where the order is listed */
  location_id: number

  /** Minimum quantity that must be bought/sold in one transaction */
  min_volume: number

  /** Unique order ID */
  order_id: number

  /** ISK price per unit */
  price: number

  /** The order's effective range (e.g. station, region, etc.) */
  range: MarketOrderRange

  /** Type ID of the item being traded */
  type_id: number

  /** Remaining volume available on the order */
  volume_remain: number

  /** Total original volume listed in the order */
  volume_total: number
}
