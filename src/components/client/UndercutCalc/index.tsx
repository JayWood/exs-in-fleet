import {PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import {MarketOrder, parseMarketOrderPaste} from "@/lib/shared";
import {useState} from "react";
import Item from "@/components/client/UndercutCalc/item";

export default function UndercutCalc() {
    const [orders, setOrders] = useState<MarketOrder[]>([])
    const [undercutPercentage, setUndercutPercentage] = useState<number>(1)

    return (
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
                            onChange={(e) => setOrders(parseMarketOrderPaste(e.target.value, undercutPercentage))}
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
                                    <th>Net Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map((order, index) => (
                                    <Item
                                        order={order}
                                        key={index}
                                        undercutPercentage={undercutPercentage}
                                        onChange={(v) => {
                                            const newOrders = [...orders];
                                            newOrders[index].netPrice = newOrders[index].price * (1 - v / 100);
                                            setOrders(newOrders);
                                        }}
                                    />
                                ))}
                                </tbody>
                            </table>
                            <button
                                className="btn btn-primary btn-sm mt-4 w-full"
                                onClick={() => {
                                    let text = '';
                                    orders.forEach(order => {
                                        text += `${order.name}\t${order.netPrice}\n`;
                                    });
                                    navigator.clipboard.writeText(text);
                                }}
                            >
                                <PencilSquareIcon className="w-4 h-4 mr-1"/>
                                Copy to clipboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}