'use client';
import {MarketGroupNode} from "@/lib/db/market";

interface MarketTreeProps {
    nodes: MarketGroupNode[];
}

const MarketTree = ({ nodes }: MarketTreeProps) => {
    return (
        <ul className="menu menu-xs bg-base-200 rounded-box max-w-xs w-full">
            {nodes.map((node) => (
                <TreeNode key={node.marketGroupID} node={node} />
            ))}
        </ul>
    );
};

const TreeNode = ({ node }: { node: MarketGroupNode }) => {
    const hasChildren = node.children && node.children.length > 0;

    if (hasChildren) {
        return (
            <li>
                <details>
                    <summary>{node.marketGroupName}</summary>
                    <ul>
                        {node.children!.map((child) => (
                            <TreeNode key={child.marketGroupID} node={child} />
                        ))}
                    </ul>
                </details>
            </li>
        );
    }

    return (
        <li>
            <a>{node.marketGroupName}</a>
        </li>
    );
};

export default MarketTree;