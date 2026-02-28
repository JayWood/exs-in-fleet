'use client'

import {useRef, useState} from 'react'

import {MagnifyingGlassCircleIcon} from '@heroicons/react/16/solid'
import axios from 'axios'
import {debounce} from 'next/dist/server/utils'
import {
  GenericObject,
  InvTypeDocument,
  PriceComparisonType,
  UserSettings
} from '@/lib/db/collections'

interface PriceComparisonFormProps {
  onChange: (data: PriceComparisonType) => void
  onSubmit: (data: PriceComparisonType) => void
  structures?: GenericObject[]
  value: PriceComparisonType
}

const PriceComparisonForm = ({value, onSubmit, onChange, structures}: PriceComparisonFormProps) => {
  const [formState, setFormState] = useState<any>({...value})
  const [processing, setProcessing] = useState(false)
  const [itemNames, setItemNames] = useState<string>(
    value?.items?.map(item => item.name).join('\n') || ''
  )

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form
        onSubmit={e => {
          setProcessing(true)
          e.preventDefault()
          const items = itemNames.split('\n').map(name => name.trim())
          axios
            .post('/api/eve/sde/invTypes', {action: 'itemSearch', items})
            .then((res: { status: number; data: InvTypeDocument[] }) => {
              if (res.status != 200) {
                return
              }

              setProcessing(false)
              onSubmit({
                ...formState,
                items: res.data.map(({typeName, typeID}) => {
                  return {name: typeName, typeId: typeID}
                })
              })
            })
        }}
        className="space-y-4"
      >
        <div className="form-control">
          <label className="label block">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            name="title"
            value={value?.title || ''}
            onChange={e => {
              onChange({...formState, title: e.target.value})
              setFormState({...formState, title: e.target.value})
            }}
            className="input input-bordered"
            placeholder="Enter title"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label block">
              <span className="label-text">Source Structure</span>
            </label>
            <select
              name="sourceStructure"
              value={value?.source?.id || ''}
              onChange={e => {
                const selectedStructure = structures?.find(
                  structure => structure.id == e.target.value
                )
                onChange({
                  ...formState,
                  source: {
                    id: selectedStructure?.id || '',
                    name: selectedStructure?.name || ''
                  }
                })
                setFormState({
                  ...formState,
                  source: {
                    id: selectedStructure?.id || '',
                    name: selectedStructure?.name || ''
                  }
                })
              }}
              className="select select-bordered"
            >
              <option value="" disabled>
                Select source structure
              </option>
              {structures?.map(structure => (
                <option key={structure.id} value={structure.id}>
                  {structure.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label block">
              <span className="label-text">Target Structure</span>
            </label>
            <select
              name="targetStructure"
              value={value?.target?.id || ''}
              onChange={e => {
                const selectedStructure = structures?.find(
                  structure => structure.id == e.target.value
                )
                onChange({
                  ...formState,
                  target: {
                    id: selectedStructure?.id || '',
                    name: selectedStructure?.name || ''
                  }
                })
                setFormState({
                  ...formState,
                  target: {
                    id: selectedStructure?.id || '',
                    name: selectedStructure?.name || ''
                  }
                })
              }}
              className="select select-bordered"
            >
              <option value="" disabled>
                Select target structure
              </option>
              {structures?.map(structure => (
                <option key={structure.id} value={structure.id}>
                  {structure.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Section */}
        <div className="form-control">
          <label className="label block">
            <span className="label-text">Items</span>
          </label>
          <div className="w-full">
            <textarea
              className="textarea w-full"
              value={itemNames}
              onChange={e => {
                setItemNames(e.target.value)
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Save
        </button>
      </form>
    </div>
  )
}

export default PriceComparisonForm
