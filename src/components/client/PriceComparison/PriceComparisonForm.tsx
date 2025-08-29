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
  onSubmit: () => void
  value: PriceComparisonType
}

const PriceComparisonForm = ({
  onChange,
  value,
  onSubmit
}: PriceComparisonFormProps) => {
  const [searchResults, setSearchResults] = useState<GenericObject[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<string>('string')
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const searchItems = async (query: string) => {
    setSearchType('string')
    setIsSearching(true)
    await axios.get(`/api/eve/sde/invTypes?s=${query}`).then(res => {
      setSearchResults(
        res.data.map((item?: InvTypeDocument) => ({
          typeId: item?.typeID,
          name: item?.typeName
        }))
      )
      setIsSearching(false)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit()
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
            onChange={e => onChange({ ...value, title: e.target.value })}
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
              onChange={e =>
                onChange({
                  ...value,
                  source: { ...value.source, name: e.target.value }
                })
              }
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
              onChange={e =>
                onChange({
                  ...value,
                  source: { ...value.source, id: e.target.value }
                })
              }
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
              onChange={e =>
                onChange({
                  ...value,
                  target: { ...value.target, name: e.target.value }
                })
              }
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
              onChange={e =>
                onChange({
                  ...value,
                  target: { ...value.target, id: e.target.value }
                })
              }
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
          <div className="flex gap-2">
            <label className="input grow">
              <MagnifyingGlassCircleIcon className="w-4 h-4" />
              <input
                type="search"
                className="grow"
                placeholder="Search - or use type IDs, separated by comma/space: ie. 1,2,3,4,5"
                list="searchResults"
                value={searchQuery}
                onChange={evt => {
                  const searchQuery = evt.target.value
                  if (timeoutId.current) {
                    clearTimeout(timeoutId.current)
                  }

                  setSearchQuery(searchQuery)
                  const isTypeIdList = /^\d+(?:[,\s]\d+)*$/.test(searchQuery)
                  if (isTypeIdList) {
                    setIsSearching(true)
                    setSearchType('typeId')
                    const separator = searchQuery.includes(',') ? ',' : ' '
                    const typeIds = searchQuery
                      .split(separator)
                      .map(id => parseInt(id.trim()))
                    axios
                      .get(`/api/eve/sde/invTypes?typeIds=${typeIds.join(',')}`)
                      .then(res => {
                        setIsSearching(false)
                        const r = res.data.map((item?: InvTypeDocument) => ({
                          typeId: item?.typeID,
                          name: item?.typeName
                        }))
                        setSearchResults(r)
                      })
                    return
                  }

                  if (searchQuery.length < 3 || isTypeIdList) {
                    return
                  }

                  if (
                    searchResults.some(item =>
                      item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                  ) {
                    return
                  }

                  timeoutId.current = setTimeout(() => {
                    searchItems(evt.target.value)
                  }, 500)
                }}
              />
              {isSearching && (
                <span className="loading loading-dots loading-xs"></span>
              )}
              <datalist id="searchResults">
                {searchResults?.map((item, index) => (
                  <option key={index} value={item.name}></option>
                ))}
              </datalist>
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                searchQuery.length === 0 ||
                isSearching ||
                (!searchResults.some(item =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                ) &&
                  searchType === 'string')
              }
              onClick={() => {
                if (searchType === 'typeId') {
                  onChange({
                    ...value,
                    items: [...value?.items, ...searchResults]
                  })
                  setSearchQuery('')
                  return
                }

                const result = searchResults.find(item =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                if (result) {
                  onChange({ ...value, items: [...value?.items, result] })
                }
                setSearchQuery('')
              }}
            >
              Add
            </button>
          </div>

          {/* Items List */}
          <div className="mt-2">
            {value?.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <span className="flex-grow">{item.name}</span>
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => {
                    onChange({
                      ...value,
                      items: value.items.filter((_, i) => i !== index)
                    })
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
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
