'use client'

import { useRef, useState } from 'react'

import { MagnifyingGlassCircleIcon } from '@heroicons/react/16/solid'
import axios from 'axios'
import { debounce } from 'next/dist/server/utils'
import {
  GenericObject,
  InvTypeDocument,
  PriceComparisonType,
  UserSettings
} from '@/lib/db/collections'

interface PriceComparisonFormProps {
  onChange: (data: PriceComparisonType) => void
  onSubmit: (data: PriceComparisonType) => void
  value: PriceComparisonType
}

const PriceComparisonForm = ({ value, onSubmit, onChange }: PriceComparisonFormProps) => {
  const [formState, setFormState] = useState<any>({ ...value })
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
            .post('/api/eve/sde/invTypes', { action: 'itemSearch', items })
            .then((res: { status: number; data: InvTypeDocument[] }) => {
              if (res.status != 200) {
                return
              }

              setProcessing(false)
              onSubmit({
                ...formState,
                items: res.data.map(({ typeName, typeID }) => {
                  return { name: typeName, typeId: typeID }
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
            } }
            className="input input-bordered"
            placeholder="Enter title"
          />
        </div>

        {/* Source Structure Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label block">
              <span className="label-text">Source Structure Name</span>
            </label>
            <input
              type="text"
              name="sourceStructureName"
              value={value?.source?.name || ''}
              onChange={e => {
                onChange({...formState, source: { ...formState.source, name: e.target.value }})
                setFormState({
                  ...formState,
                  source: { ...formState.source, name: e.target.value }
                })
              } }
              className="input input-bordered"
              placeholder="Enter source structure name"
            />
          </div>

          <div className="form-control">
            <label className="label block">
              <span className="label-text">Source Structure ID</span>
            </label>
            <input
              type="text"
              name="sourceStructureId"
              value={value?.source?.id || ''}
              onChange={e =>{
                  onChange({...formState, source: { ...formState.source, id: e.target.value }})
                  setFormState({
                      ...formState,
                      source: { ...formState.source, id: e.target.value }
                  })
              } }
              className="input input-bordered"
              placeholder="Enter source structure ID"
            />
          </div>
        </div>

        {/* Target Structure Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label block">
              <span className="label-text">Target Structure Name</span>
            </label>
            <input
              type="text"
              name="targetStructureName"
              value={value?.target?.name || ''}
              onChange={e => {
                  onChange({...formState, target: { ...formState.target, name: e.target.value }})
                  setFormState({
                      ...formState,
                      target: { ...formState.target, name: e.target.value }
                  })
              } }
              className="input input-bordered"
              placeholder="Enter target structure name"
            />
          </div>

          <div className="form-control">
            <label className="label block">
              <span className="label-text">Target Structure ID</span>
            </label>
            <input
              type="text"
              name="targetStructureId"
              value={value?.target?.id || ''}
              onChange={e => {
                  onChange({...formState, target: { ...formState.target, id: e.target.value }})
                  setFormState({
                      ...formState,
                      target: { ...formState.target, id: e.target.value }
                  })
              } }
              className="input input-bordered"
              placeholder="Enter target structure ID"
            />
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
                // const items = e.target.value
                //   .split('\n')
                //   .map(name => ({ name: name.trim() }))
                // setFormState({ ...formState, searchItems: items })
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
