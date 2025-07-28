'use client'

import CardMedium from "@/components/ui/CardMedium";
import Chevron from "@/components/ui/Chevron";
import Link from "next/link";
import {useState} from "react";
import PriceComparisonForm from "@/components/client/PriceComparisonForm";
import axios from "axios";

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

export interface PriceComparisonProps {
    sourceSystem: systemInformation;
    targetSystem: systemInformation;
    prices: PriceData[];
    title: string;
}

const calculateDiffPercentage = (target: number, source: number): number => {
    if (!source || 0 === source) {
        return 0;
    }

    return Number((((target - source) / source) * 100).toFixed(2));
}

const PriceComparison = ({title, sourceSystem, targetSystem, prices}: PriceComparisonProps) => {
    const [editing, setEditing] = useState(false);

    return (
        <CardMedium cardTitle={title}>
            <div className="overflow-x-auto">
                {editing && <PriceComparisonForm onSubmit={(data) => {
                    const dbData = {
                        title: data.title,
                        sourceStructure: {
                            name: data.sourceStructureName,
                            structureId: data.sourceStructureId,
                        },
                        targetStructure: {
                            name: data.targetStructureName,
                            structureId: data.targetStructureId,
                        },
                        typeIds: data.items.map(item => item.typeId),
                    }
                    axios.post('/api/user', dbData).then(res => { console.log(res)})
                }}/>}
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
                            <th>{`${sourceSystem.name} Min-Sell`}</th>
                            <th>{`${targetSystem.name} Stock`}</th>
                            <th>{`${targetSystem.name} Min-Sell`}</th>
                            <th>{`${targetSystem.name} Diff %`}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            prices?.map(({source, target, targetStock, item}: PriceData, index) => {
                                const calculation = calculateDiffPercentage(target, source);
                                return (
                                    <tr key={index}>
                                        <td><Link className="link" href={`https://evetycoon.com/market/${item.typeId}`}
                                                  target="_blank">{item.name}</Link></td>
                                        <td>{source.toLocaleString()}</td>
                                        <td>{targetStock.toLocaleString()}</td>
                                        <td>{target.toLocaleString()}</td>
                                        <td className="flex">
                                            <Chevron median={0} buffer={10} maxBuffer={20} value={calculation}>
                                                {calculation}%
                                            </Chevron>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </>}
            </div>
        </CardMedium>
    )
};

export default PriceComparison;
