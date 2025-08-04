'use client'

import CardMedium from "@/components/ui/CardMedium";
import {useEffect, useState} from "react";
import PriceComparisonForm from "@/components/client/PriceComparisonForm";
import axios from "axios";
import {PriceComparisonType, UserSettings} from "@/lib/db/collections";

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

const calculateDiffPercentage = (target: number, source: number): number => {
  if (!source || 0 === source) {
    return 0;
  }

  return Number((((target - source) / source) * 100).toFixed(2));
}

const PriceComparison = ({value}: { value: PriceComparisonType }) => {
  const [editing, setEditing] = useState(false);
  const defaultSettings = {
    title: 'Test',
    source: {
      name: '',
      id: ''
    },
    target: {
      name: '',
      id: ''
    },
    items: []
  }
  const [componentState, setComponentState] = useState<PriceComparisonType>( defaultSettings );

  useEffect(() => {
    setComponentState(value || defaultSettings );
  }, [])

  return (
    <CardMedium cardTitle={componentState?.title}>
      <div className="overflow-x-auto">
        {editing && <PriceComparisonForm
					value={componentState}
					onChange={(data: PriceComparisonType) => setComponentState(data)}
          onSubmit={() => {
            axios.post('/api/user', {priceComparisons: [componentState]}).then(res => console.log(res.data))
            // setEditing(false);
          }}
        />}
        {!editing && <>
					<button
						className="btn btn-primary btn-sm mb-2 float-right"
						onClick={() => {
              setEditing(!editing)
            }}
					>
            {editing ? 'Submit' : 'Edit'}
					</button>
					<table className="table table-xs table-zebra">
						<thead>
						<tr>
							<th>Name</th>
							<th>{`${componentState?.source?.name} Min-Sell`}</th>
							<th>{`${componentState?.target?.name} Stock`}</th>
							<th>{`${componentState?.target?.name} Min-Sell`}</th>
							<th>{`${componentState?.target?.name} Diff %`}</th>
						</tr>
						</thead>
						<tbody>
            {/*{*/}
            {/*    prices?.map(({source, target, targetStock, item}: PriceData, index) => {*/}
            {/*        const calculation = calculateDiffPercentage(target, source);*/}
            {/*        return (*/}
            {/*            <tr key={index}>*/}
            {/*                <td><Link className="link" href={`https://evetycoon.com/market/${item.typeId}`}*/}
            {/*                          target="_blank">{item.name}</Link></td>*/}
            {/*                <td>{source.toLocaleString()}</td>*/}
            {/*                <td>{targetStock.toLocaleString()}</td>*/}
            {/*                <td>{target.toLocaleString()}</td>*/}
            {/*                <td className="flex">*/}
            {/*                    <Chevron median={0} buffer={10} maxBuffer={20} value={calculation}>*/}
            {/*                        {calculation}%*/}
            {/*                    </Chevron>*/}
            {/*                </td>*/}
            {/*            </tr>*/}
            {/*        )*/}
            {/*    })*/}
            {/*}*/}
						</tbody>
					</table>
				</>}
      </div>
    </CardMedium>
  )
};

export default PriceComparison;
