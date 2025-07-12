import {createProjection, readMany} from "@/lib/db/mongoHelpers";
import {Filter} from "mongodb";
import {InvMarketGroup, InvMarketGroupDocument, InvType, InvTypeDocument} from "@/lib/db/collections";

export async function getMarketLayout() {
    const invTypeFilter: Filter<InvType> = {
        published: 1,
        marketGroupID: {$ne: "None"}
    };
    const invTypeProjection = createProjection<InvType>(['typeID', 'typeName', 'marketGroupID', 'iconID'])
    const marketProjection = createProjection<InvMarketGroup>(['marketGroupID','marketGroupName','parentGroupID','iconID']);

    const [invTypes, marketGroups] = await Promise.all( [
        readMany<InvTypeDocument>('invTypes', invTypeFilter, invTypeProjection),
        readMany<InvMarketGroupDocument>( 'marketGroups', {}, marketProjection )
    ] )
}