import {NextRequest, NextResponse} from "next/server";
import {Client} from "@/lib/esi/Client";
import {PriceData} from "@/components/client/PriceComparison/PriceComparison";
import {fuzzworkStructures, getFuzzworksData} from "@/app/api/fuzzworks/route";
import {readMany} from "@/lib/db/mongoHelpers";
import {json} from "node:stream/consumers";
import {AggregatedOrders, groupAndAggregate} from "@/lib/market";
import {MarketCache, MarketCacheDocument} from "@/lib/db/collections";

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
      "target": 20000,
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
      "target": 46000,
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
      "target": 33,
      "targetStock": 10468,
      "item": {
        "name": "Tesseract Capacitor Unit",
        "typeId": 11554
      }
    },
    {
      "source": 9113,
      "target": 9122,
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

const getStructureAggregatedOrders = async ( structureId: number, typeIds: number[] ) => {
  if ( fuzzworkStructures.some(s => s.station === structureId) ) {
    const resp = await getFuzzworksData(structureId.toString(), typeIds.join(','));
    return resp.json();
  }

  console.log( typeIds );
  const rows = await readMany( 'marketCache', { structureId: structureId, typeId: { $in: typeIds } } );
  const aggregated = rows.reduce((acc, row) => {
    const {typeId, buy, sell, structureId} = row as MarketCacheDocument;
    acc[typeId] = {buy, sell, structureId};
    return acc;
  }, {} as AggregatedOrders);

  return aggregated;
}

export async function GET( request: NextRequest ): Promise<NextResponse> {
  const {searchParams} = new URL( request.url );
  const sourceId = Number(searchParams.get('source'))
  const targetId = Number(searchParams.get('target'))
  const itemIds = searchParams.get('itemIds')?.split(',').map(n=>Number(n)) || [];

  // Optionally validate inputs
  if (isNaN(sourceId) || isNaN(targetId)) {
    return NextResponse.json({error: 'Invalid parameters'}, {status: 400})
  }

  const sourceOrders = await getStructureAggregatedOrders( sourceId, itemIds );
  const targetOrders = await getStructureAggregatedOrders( targetId, itemIds );

  // TODO: Merge and calculate both of these into the table.
  console.log( { sourceOrders, targetOrders } );

  const data: PriceData[] = getPriceComparison({sourceSystemId: sourceId, targetStructureId: targetId, itemIds})
  return NextResponse.json(data)
}
