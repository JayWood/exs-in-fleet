'use client'

import CardMedium from "@/components/ui/CardMedium";
import Table from "@/components/ui/Table";

interface Item {
  typeId: string;
  name: string;
}

interface systemInformation {
  name: string;
  systemId: string;
}

interface PriceData {
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

const PriceComparison = ( {title, sourceSystem, targetSystem, prices}: PriceComparisonProps ) => {
  return (
    <CardMedium cardTitle={title}>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
          <tr>
            <th>Name</th>
            <th>{ `${sourceSystem} Min-Sell` }</th>
            <th>{ `${targetSystem} Stock` }</th>
            <th>{ `${targetSystem} Min-Sell` }</th>
            <th>{ `${targetSystem} Diff %` }</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          </tbody>
        </table>
      </div>
    </CardMedium>
  )
};

export default PriceComparison;
