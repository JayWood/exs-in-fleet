import { MarketOrder } from '@/lib/shared'

interface ItemProps {
  order: MarketOrder
  undercutPercentage: number
  onChange: (v: number) => void
}

export default function Item({
  order,
  undercutPercentage,
  onChange
}: ItemProps) {
  return (
    <tr>
      <td>
        <input
          type="text"
          className="input input-ghost input-sm w-full"
          value={order.name}
          readOnly
        />
      </td>
      <td>
        <input
          type="text"
          className="input input-ghost input-sm w-full"
          value={order.price.toLocaleString(undefined, {
            maximumFractionDigits: 2
          })}
          readOnly
        />
      </td>
      <td>
        <input
          type="number"
          className="input input-bordered input-sm w-full"
          defaultValue={undercutPercentage}
          onChange={e => onChange(Number(e.target.value))}
          placeholder="0.01"
          step="0.01"
          min="0"
        />
      </td>
      <td>
        <input
          type="text"
          className="input input-ghost input-sm w-full"
          value={order.netPrice.toLocaleString(undefined, {
            maximumFractionDigits: 2
          })}
          readOnly
        />
      </td>
    </tr>
  )
}
