import {NextRequest, NextResponse} from "next/server";
import {PriceData} from "@/components/client/PriceComparison";

export type priceCompareParams = {
  sourceSystemId?: number
  targetStructureId?: number
  itemIds?: number[]
}

export function getPriceComparison( props?: priceCompareParams ) {
  return [
    {
      "source": 164800,
      "target": 196300,
      "targetStock": 2983,
      "item": {
        "name": "Antimatter Reactor Unit",
        "typeId": 11549
      }
    },
    {
      "source": 22270,
      "target": 33040,
      "targetStock": 843,
      "item": {
        "name": "EM Pulse Generator",
        "typeId": 11694
      }
    },
    {
      "source": 40000,
      "target": 49500,
      "targetStock": 3267,
      "item": {
        "name": "Fusion Thruster",
        "typeId": 11532
      }
    },
    {
      "source": 26870,
      "target": 30000,
      "targetStock": 4198,
      "item": {
        "name": "Laser Focusing Crystals",
        "typeId": 11689
      }
    },
    {
      "source": 47840,
      "target": 63790,
      "targetStock": 9648,
      "item": {
        "name": "Linear Shield Emitter",
        "typeId": 11557
      }
    },
    {
      "source": 52380,
      "target": 67690,
      "targetStock": 4141,
      "item": {
        "name": "Nanoelectrical Microprocessor",
        "typeId": 11539
      }
    },
    {
      "source": 29050,
      "target": 44470,
      "targetStock": 29501,
      "item": {
        "name": "Radar Sensor Cluster",
        "typeId": 11537
      }
    },
    {
      "source": 59360,
      "target": 69010,
      "targetStock": 10468,
      "item": {
        "name": "Tesseract Capacitor Unit",
        "typeId": 11554
      }
    },
    {
      "source": 9113,
      "target": 11720,
      "targetStock": 189937,
      "item": {
        "name": "Tungsten Carbide Armor Plate",
        "typeId": 11543
      }
    },
    {
      "source": 28390000,
      "target": 34390000,
      "targetStock": 229,
      "item": {
        "name": "U-C Trigger Neurolink Conduit",
        "typeId": 57470
      }
    }
  ];
}

export async function GET( request: NextRequest ): Promise<NextResponse> {
  const {searchParams} = new URL( request.url );
  const sourceSystemId = Number(searchParams.get('sourceSystemId'))
  const targetStructureId = Number(searchParams.get('targetStructureId'))
  const itemIds = searchParams.get('itemIds')?.split(',').map(n=>Number(n)) || [];

  // Optionally validate inputs
  if (isNaN(sourceSystemId) || isNaN(targetStructureId)) {
    return NextResponse.json({error: 'Invalid parameters'}, {status: 400})
  }

  const data: PriceData[] = getPriceComparison({sourceSystemId, targetStructureId, itemIds})
  return NextResponse.json(data)
}
