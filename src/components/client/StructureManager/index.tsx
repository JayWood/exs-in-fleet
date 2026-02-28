import {useState} from "react";
import {GenericObject} from "@/types/collections";
import {tradeStations} from "@/lib/shared";

interface StructureManagerProps {
    onChange: (arg0: GenericObject[]) => void;
    value: GenericObject[];
    loading: boolean;
}
export default function StructureManager( {onChange, value, loading}: StructureManagerProps ) {
    const [structures, setStructures] = useState<GenericObject[]>( value || [ {name: "", id: ""} ] );

    const handleAddRow = () => {
        setStructures([...structures, {name: "", id: ""}]);
    };

    const handleRemoveRow = (index: number) => {
        if ( structures.length <= 1 ) {
            return;
        }

        setStructures(structures.filter((_, i) => i !== index));
    };

    const handleInputChange = (index: number, field: string, value: string) => {
        const updatedStructures = structures.map((structure, i) =>
            i === index ? {...structure, [field]: value} : structure
        );
        setStructures(updatedStructures);
    };

    const handleSave = () => {
        onChange( structures );
        console.log("Saved Structures:", structures);
    };

    return (
        <>
            <h3 className="font-bold text-lg">Saved Structures</h3>
            <div>
                {structures.map((structure, index) => (
                    <div key={index} className="flex space-x-4 mb-2 justify-center items-center">
                        <input
                            type="text"
                            placeholder="Structure Name"
                            disabled={loading}
                            value={structure.name}
                            onChange={(e) =>
                                handleInputChange(index, "name", e.target.value)
                            }
                            className="input input-bordered w-full"
                        />
                        <input
                            type="text"
                            placeholder="Structure ID"
                            disabled={loading}
                            value={structure.id}
                            onChange={(e) =>
                                handleInputChange(index, "id", e.target.value)
                            }
                            className="input input-bordered w-full"
                        />
                        <button
                            onClick={() => handleRemoveRow(index)}
                            className="btn btn-error btn-sm"
                            disabled={loading || structures?.length <= 1}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <p className="text-xs text-gray-500 mb-2"><em>
                    Structures available by default: {Object.keys(tradeStations).map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")}
                </em></p>
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={handleAddRow}
                        className="btn btn-secondary btn-sm"
                        disabled={loading}
                    >
                        Add Structure
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary btn-sm"
                        disabled={loading}
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}