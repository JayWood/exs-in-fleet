'use client'

import CardMedium from "@/components/ui/CardMedium";
import Table from "@/components/ui/Table";

interface Item {
  typeId: number;
  name: string;
}

interface systemInformation {
  name: string;
  systemId?: string;
  structureId?: string;
}

export interface PriceData {
  source: number;
  target: number;
  targetStock: number;
  item: Item;
}

export interface PriceComparisonProps{
  sourceSystem: systemInformation;
  targetSystem: systemInformation;
  prices: PriceData[];
  title: string;
}

const calculateDiffPercentage = ( target: number, source: number ): number => {
  if ( ! source || 0 === source ) {
    return 0;
  }

  return Number((((target - source) / source) * 100).toFixed(2));
}

const PriceComparison = ( {title, sourceSystem, targetSystem, prices}: PriceComparisonProps ) => {
  return (
    <CardMedium cardTitle={title}>
      <div className="overflow-x-auto">
        <table className="table table-xs table-zebra">
          <thead>
          <tr>
            <th>Name</th>
            <th>{ `${sourceSystem.name} Min-Sell` }</th>
            <th>{ `${targetSystem.name} Stock` }</th>
            <th>{ `${targetSystem.name} Min-Sell` }</th>
            <th>{ `${targetSystem.name} Diff %` }</th>
          </tr>
          </thead>
          <tbody>
          {
            prices?.map( ({source, target, targetStock, item}: PriceData, index ) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{source.toLocaleString()}</td>
                <td>{targetStock.toLocaleString()}</td>
                <td>{target.toLocaleString()}</td>
                <td>{calculateDiffPercentage(target, source)}</td>
              </tr>
            ) )
          }
          </tbody>
        </table>
      </div>
    </CardMedium>
  )
};

export default PriceComparison;
