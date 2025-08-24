'use client';

import {EllipsisVerticalIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import {MarketOrder, parseMarketOrderPaste} from "@/lib/shared";
import {useState} from "react";

export default function SectionTools() {
  const [orders, setOrders] = useState<MarketOrder[]>([])
  const [undercutPercentage, setUndercutPercentage] = useState(0.1)
  const [sellOrders, setSellOrders] = useState<Record<string,number>[]>([])

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3>Tools</h3>
        <div className="dropdown dropdown-end">
          <button className="btn btn-xs btn-link p-0">
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-500 hover:text-gray-800"/>
          </button>
          <ul className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-44 text-sm">
            <li>
              <a href="#"
                 className="w-full"
                 onClick={()=>null }>Menu Item</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
        <div className="card card-border bg-base-100 card-md shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div className="card-title">Undercut Calculator</div>
                <div>
                  <button
                    className="btn btn-link mb-2 px-0"
                    onClick={()=>null}
                  >
                    <TrashIcon className="w-4 h-4  text-gray-500 hover:text-gray-800"/>
                  </button>
                </div>
            </div>
            <div className="overflow-x-auto px-4 py-2">

              <div className="form-control mb-4">
                <label className="label label-block">
                  <span className="label-text">Base Percentage</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full mb-2"
                  placeholder="Enter percentage (e.g. 0.01 for 0.01%)"
                  step="0.01"
                  value={undercutPercentage}
                  onChange={(e) => setUndercutPercentage(Number(e.target.value))}
                  min="0"
                />
                <span className="secondary text-gray-200 text-xs">Enter a percentage to undercut market orders by that amount</span>
              </div>

              <div className="form-control">
                <label className="block mb-2 label label-block">Buy Orders</label>
                <textarea
                  className="textarea h-24 w-full"
                  placeholder={"" +
                    "The Damsel's Drunk Bodyguard\t1\t7,999,000.00\t7,999,000.00\n" +
                    "Spaceship Command\t1\t4,500.00\t4,500.00\n" +
                    "Total:\t\t\t39,748,500.00\n" +
                    ""}
                  onChange={(e) => setOrders(parseMarketOrderPaste(e.target.value))}
                ></textarea>
              </div>
              {orders.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <table className="table table-sm">
                    <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Undercut %</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((order, index) => (
                      <tr key={index}>
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
                            value={order.price}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input input-bordered input-sm w-full"
                            defaultValue={undercutPercentage}
                            placeholder="0.01"
                            step="0.01"
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
