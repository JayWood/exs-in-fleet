'use client'

import CardMedium from "@/components/ui/CardMedium";
import {useEffect, useState} from "react";
import PriceComparisonForm from "@/components/client/PriceComparison/PriceComparisonForm";
import axios from "axios";
import {PriceComparisonType, UserSettings} from "@/lib/db/collections";
import {Cog6ToothIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import Chevron from "@/components/ui/Chevron";

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

interface PriceComparisonProps {
    value: PriceComparisonType;
    onUpdate: (value: PriceComparisonType) => void;
    onDelete: () => void;
    editMode?: boolean
}

const PriceComparison = ({value, onUpdate, onDelete, editMode}: PriceComparisonProps) => {
    const defaultSettings = {
        title: '',
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

    const [showEditingForm, setshowEditingForm] = useState(false);
    const [componentState, setComponentState] = useState<PriceComparisonType>(value || defaultSettings);
    const [prices, setPrices] = useState<PriceData[]>([]);

    // Set component state based on value if empty
    useEffect(() => {
        if (!componentState) {
            setComponentState(value || defaultSettings);
        }
    }, [value, componentState])

    useEffect(() => {
        const {target, source, items} = componentState;
        if (!target?.id || !source?.id || !items?.length) {
            return;
        }
        if (prices.length === 0) {
            const apiUrl = new URL('/api/market/comparisons', window.location.origin);
            apiUrl.searchParams.append('target', target.id);
            apiUrl.searchParams.append('source', source.id);
            apiUrl.searchParams.append('itemIds', items.map(i => i.typeId).join(','));
            axios.get(apiUrl.toString())
              .then(res => setPrices(res.data))
              .catch(err => console.error('Failed to fetch prices:', err));
        }
    }, [componentState, prices])

    return (
        <div className="card card-border bg-base-100 card-md shadow-sm">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <div className="card-title">{componentState.title}</div>
                    { editMode && (
                      <div>
                          <button
                            className="btn btn-link mb-2 px-0"
                            onClick={onDelete}
                          >
                              <TrashIcon className="w-4 h-4  text-gray-500 hover:text-gray-800"/>
                          </button>
                          <button
                            className="btn btn-link mb-2"
                            onClick={() => {
                                setshowEditingForm(!showEditingForm)
                            }}
                          >
                              <PencilSquareIcon className="w-4 h-4 mr-1  text-gray-500 hover:text-gray-800"/>
                          </button>
                      </div>
                    ) }
                </div>
                <div className="overflow-x-auto">
                    {showEditingForm && <PriceComparisonForm
                        value={componentState}
                        onChange={(data: PriceComparisonType) => setComponentState(data)}
                        onSubmit={() => {onUpdate(componentState); setshowEditingForm(false)}}
                    />}
                    {!showEditingForm && <>
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
            </div>
        </div>
    )
};

export default PriceComparison;
