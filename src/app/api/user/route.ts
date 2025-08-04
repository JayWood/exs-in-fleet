import {NextRequest, NextResponse} from "next/server";
import {getCurrentUserId} from "@/lib/shared";
import {readOne, updateOne} from "@/lib/db/mongoHelpers";
import {Ajv, JSONSchemaType} from "ajv";
import {UserDocument, UserSettings} from "@/lib/db/collections";

const userSettingsSchema: JSONSchemaType<UserSettings> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    structures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          id: {type: 'string'}
        },
        required: ['name', 'id'],
        additionalProperties: false
      }
    },
    priceComparisons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {type: 'string'},
          source: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              id: {type: 'string'}
            },
            required: ['name', 'id']
          },
          target: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              id: {type: 'string'}
            },
            required: ['name', 'id']
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                typeId: {type: 'number'},
                name: {type: 'string'}
              }
            }
          }
        },
        required: ['title', 'source', 'target', 'items'],
        additionalProperties: false
      }
    }
  }
};

export async function POST(nextRequest: NextRequest) {
  const playerId = getCurrentUserId(nextRequest);
  const payload = await nextRequest.json();

  const ajv = new Ajv();
  const validate = ajv.compile(userSettingsSchema);

  console.log( JSON.stringify(payload, null, 2) );

  if (!validate(payload)) {
    console.log( JSON.stringify(payload, null, 2) );
    return NextResponse.json({error: validate.errors}, {status: 400});
  }

  const playerDocument: UserDocument | null = await readOne<UserDocument>('eveUsers', {playerId});
  if (!playerDocument) {
    return NextResponse.json({error: 'User does not exist'}, {status: 500});
  }

  const {settings} = playerDocument;
  const {structures, priceComparisons} = payload;

  await updateOne<UserDocument>('eveUsers', {playerId}, {
    ...playerDocument,
    settings: {
      ...settings,
      ...(structures && {structures}),
      ...(priceComparisons && {priceComparisons})
    }
  }, {upsert: true});
  return NextResponse.json('success');
}
