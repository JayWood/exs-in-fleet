'use client'

import {
  ArrowPathIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import {GenericObject, PriceComparisonType, UserDocument} from '@/types/collections'
import PriceComparison from '@/components/client/PriceComparison/PriceComparison'
import {useEffect, useId, useState} from 'react'
import axios from 'axios'
import {BuildingStorefrontIcon} from "@heroicons/react/16/solid";
import StructureManager from "@/components/client/StructureManager";
import {tradeStations} from "@/lib/shared";
import core from "ajv/lib/vocabularies/core";
import {parseJson} from "ajv/lib/runtime/parseJson";

export default function SectionPriceComparison({settings}: UserDocument) {
  // Use a unique ID for the current component.
  const id = useId()

  // Set state based on server component.
  const [comparisons, setComparisons] = useState<PriceComparisonType[]>(settings?.priceComparisons || [])
  const [savedStructures, setSavedStructures] = useState<GenericObject[]>(settings?.structures)
  const [loading, setLoading] = useState(false)

  function getStructures() {
    const coreStations = Object.entries(tradeStations).map(
      ([key, value]) => (
        {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          id: value.location_id.toString()
        }
      ))

    return [...coreStations, ...savedStructures]
  }

  return (
    <>
      <div className="w-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3>Price Comparisons</h3>
          <div>
            <button className="btn btn-xs btn-link p-0 mr-6" title="Structures"
                    onClick={() => document.getElementById('structures_modal').showModal()}>
              <BuildingStorefrontIcon className="h-4 w-4 text-gray-500 hover:text-gray-800"/>
            </button>
            <button className="btn btn-xs btn-link p-0 mr-6">
              <ArrowPathIcon
                onClick={async () => {
                  try {
                    const btn = document.activeElement as HTMLButtonElement
                    btn.classList.add('loading', 'loading-xs')
                    const response = await axios.get(
                      '/api/eve/esi/markets/structures/1046664001931/aggregate',
                      {
                        timeout: 120000
                      }
                    );

                    if (!response.data) {
                      btn.classList.remove('loading', 'loading-xs');
                      return;
                    }
                  } catch (err) {
                    console.error(err)
                  }
                }}
                className="h-4 w-4 text-gray-500 hover:text-gray-800 transition-all"
              />
            </button>
            <div className="dropdown dropdown-end">
              <button className="btn btn-xs btn-link p-0">
                <EllipsisVerticalIcon className="h-4 w-4 text-gray-500 hover:text-gray-800"/>
              </button>
              <ul className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-44 text-sm">
                <li>
                  <a
                    href="#"
                    className="w-full"
                    onClick={e => {
                      e.preventDefault()
                      setComparisons([
                        ...comparisons,
                        {
                          title: '',
                          source: {name: '', id: ''},
                          target: {name: '', id: ''},
                          items: []
                        }
                      ])
                    }}
                  >
                    Add New
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
          {comparisons?.map(
            (comparison: PriceComparisonType, index: number) => (
              <PriceComparison
                key={`${id}-${comparison.title}-${comparison.source.id}-${comparison.target.id}`}
                value={comparison}
                structures={getStructures()}
                onDelete={(v: PriceComparisonType) => {
                  const newComparisons = comparisons.filter(
                    (c) => c !== v
                  )

                  if (newComparisons.length === 0) {
                    return
                  }

                  axios.post('/api/user', {structures: savedStructures, priceComparisons: newComparisons})
                  setComparisons(newComparisons)
                }}
                onUpdate={value => {
                  const newComparisons = comparisons.map((c, i) =>
                    i === index ? value : c
                  )
                  axios.post('/api/user', {structures: savedStructures, priceComparisons: newComparisons})
                  setComparisons(newComparisons)
                }}
              />
            )
          )}
        </div>
      </div>
      <dialog id="structures_modal" className="modal">
        <div className="modal-box">
          <StructureManager
            value={savedStructures}
            loading={loading}
            onChange={
              s => {
                setLoading(true)
                setSavedStructures(s)
                axios.post('/api/user', {priceComparisons: comparisons, structures: s})
                  .then(() => {
                    const dialog = document.getElementById('structures_modal') as HTMLDialogElement
                    setLoading(false)
                    dialog?.close()
                  })
              }
            }
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
