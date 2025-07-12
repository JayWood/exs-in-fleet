import {InvMarketGroup} from "@/lib/db/collections";
import {createProjection, readMany} from "@/lib/db/mongoHelpers";

export interface MarketGroupNode extends InvMarketGroup {
    children?: MarketGroupNode[];
}

function buildMarketGroupTree(groups: InvMarketGroup[]): MarketGroupNode[] {
    const groupMap = new Map<number, MarketGroupNode>();
    const roots: MarketGroupNode[] = [];

    for (const group of groups) {
        groupMap.set(group.marketGroupID, { ...group, children: [] });
    }

    for (const group of groups) {
        const node = groupMap.get(group.marketGroupID)!;
        if (group.parentGroupID !== 'None' && groupMap.has(group.parentGroupID as number)) {
            const parent = groupMap.get(group.parentGroupID as number)!;
            parent.children!.push(node);
        } else {
            roots.push(node);
        }
    }

    const sortTree = (nodes: MarketGroupNode[]) => {
        nodes.sort((a, b) => a.marketGroupName.localeCompare(b.marketGroupName));
        nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
                sortTree(node.children);
            }
        });
    };

    sortTree(roots);
    return roots;
}


export async function getMarketGroupTree() {
    const marketProjection = createProjection<InvMarketGroup>( [ 'marketGroupID', 'marketGroupName', 'parentGroupID', 'hasTypes' ] )
    const groups = await readMany<InvMarketGroup>( 'invMarketGroups', {}, marketProjection );
    return buildMarketGroupTree( groups.map(({ _id, ...rest }) => rest) );
}