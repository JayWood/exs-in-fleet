'use client';

import {EllipsisVerticalIcon} from "@heroicons/react/24/outline";
import {PriceComparisonType, UserDocument} from "@/lib/db/collections";
import PriceComparison from "@/components/client/PriceComparison/PriceComparison";
import {useEffect, useId, useState} from "react";

export default function SectionPriceComparison({settings}: { settings: UserDocument['settings'] }) {
  const id = useId();
  const [priceComparisons, setPriceComparisons] = useState<PriceComparisonType[]>([]);
  useEffect(() => {
    if (settings?.priceComparisons) {
      setPriceComparisons(settings?.priceComparisons);
    }
  }, [] )
  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3>Price Comparisons</h3>
        <div className="dropdown dropdown-end">
          <button className="btn btn-xs btn-link p-0">
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-500 hover:text-gray-800"/>
          </button>
          <ul className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-44 text-sm">
            <li><a href="#"
              className="w-full"
              onClick={(e) => {
              e.preventDefault();
              setPriceComparisons([...priceComparisons, {
                title: '',
                source: {name: '', id: ''},
                target: {name: '', id: ''},
                items: []
              }]);
            }}>Add New</a></li>
          </ul>
        </div>
      </div>
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
        {
          priceComparisons?.map( (comparison: PriceComparisonType, index: number) => (
            <PriceComparison key={`${index}-${id}`} value={comparison} />
          ))
        }
      </div>
    </div>
  )
}
