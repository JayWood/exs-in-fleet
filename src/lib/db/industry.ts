import {readMany} from "@/lib/db/mongoHelpers";
import {IndustryActivityMaterialDocument} from "@/lib/db/collections";

export const ACTIVITIES: Record<string, number|string>[] = [
    {
        "activityID": 1,
        "activityName": "Manufacturing",
        "slug": "manufacturing",
    },
    {
        "activityID": 4,
        "activityName": "Researching Material Efficiency",
        "slug": "me"
    },
    {
        "activityID": 5,
        "activityName": "Copying",
        "slug": "copy",
    },
    {
        "activityID": 11,
        "activityName": "Reactions",
        "slug": "reactions",
    },
    {
        "activityID": 8,
        "activityName": "Invention",
        "slug": "invention",
    },
    {
        "activityID": 3,
        "activityName": "Researching Time Efficiency",
        "slug": "te",
    },
    {
        "activityID": 0,
        "activityName": "None",
        "slug": "none",
    }
];

export type getMaterialsInputProps = {
    typeID: number;
    activitySlug: string;
}

export async function getMaterialsInput ({typeID, activitySlug}: getMaterialsInputProps ): Promise<IndustryActivityMaterialDocument[]> {
    const activityID = ACTIVITIES.find( a => a.slug === activitySlug )?.activityID ?? 0
    return await readMany( 'industryActivityMaterials', { typeID, activityID } )
}
