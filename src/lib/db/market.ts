import {createProjection, readMany} from "@/lib/db/mongoHelpers";
import {Filter} from "mongodb";
import {InvType} from "@/lib/db/collections";

export async function getMarketLayout() {
    const marketDocumentFilter: Filter<InvType> = {
        published: 1,
        marketGroupID: {$ne: "None"}
    };
    const projection = createProjection<InvType>(['typeID', 'typeName', 'marketGroupID', 'iconID'])
    const invTypes = readMany('invTypes', marketDocumentFilter, projection);
}