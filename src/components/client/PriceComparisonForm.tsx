'use client'

import {useRef, useState} from 'react'

import {MagnifyingGlassCircleIcon} from "@heroicons/react/16/solid";
import axios from "axios";
import {debounce} from "next/dist/server/utils";
import {InvTypeDocument} from "@/lib/db/collections";

interface FormItem {
  typeId: number;
  name: string;
}

interface PriceComparisonFormProps {
  onSubmit: (data: {
    sourceStructureName: string;
    sourceStructureId: string;
    targetStructureName: string;
    targetStructureId: string;
    title: string;
    items: FormItem[];
  }) => void;
}

const PriceComparisonForm = ({ onSubmit }: PriceComparisonFormProps) => {
  const [formData, setFormData] = useState({
    sourceStructureName: '',
    sourceStructureId: '',
    targetStructureName: '',
    targetStructureId: '',
    title: '',
    items: [] as FormItem[]
  });

  const [searchResults, setSearchResults] = useState<FormItem[]>([])
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const searchItems = async (query: string) => {
    setIsSearching(true);
    await axios.get(`/api/eve/sde/invTypes?s=${query}`).then(res => {
      setSearchResults(res.data.map((item: InvTypeDocument) => ({
        typeId: item.typeID,
        name: item.typeName
      })));
      setIsSearching(false)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div className="form-control">
          <label className="label block">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
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
              value={formData.sourceStructureName}
              onChange={handleInputChange}
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
              value={formData.sourceStructureId}
              onChange={handleInputChange}
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
              value={formData.targetStructureName}
              onChange={handleInputChange}
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
              value={formData.targetStructureId}
              onChange={handleInputChange}
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
                  placeholder="Search"
                  list="searchResults"
                  disabled={isSearching}
                  value={searchQuery}
                  onChange={(evt) => {
                    const searchQuery = evt.target.value;
                    if (timeoutId.current) {
                      clearTimeout(timeoutId.current);
                    }

                    setSearchQuery(searchQuery);
                    if (searchQuery.length < 3 ) {
                      return;
                    }

                    if (searchResults.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                      return;
                    }

                    timeoutId.current = setTimeout(() => {
                      searchItems(evt.target.value);
                    }, 500);
                  }}
              />
              { isSearching && <span className="loading loading-dots loading-xs"></span> }
              <datalist id="searchResults">{searchResults?.map( (item, index) => ( <option key={index} value={item.name}></option>) )}</datalist>
            </label>
            <button
                type="button"
                className="btn btn-primary"
                disabled={searchQuery.length === 0
                    || ! searchResults.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    || isSearching}
                onClick={() => {
                  setFormData( {...formData, items: [...formData.items, searchResults.find(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))!]})
                  setSearchQuery('');
                }}
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="mt-2">
            {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 mt-2">
                  <span className="flex-grow">{item.name}</span>
                  <button
                      type="button"
                      className="btn btn-error btn-sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PriceComparisonForm;
