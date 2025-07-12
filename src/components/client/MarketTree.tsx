'use client';
import {MarketGroupNode} from "@/lib/db/market";

interface MarketTreeProps {
    nodes: MarketGroupNode[];
    onClick?: (marketGroupID: number) => void
}

const MarketTree = ({ nodes }: MarketTreeProps) => {
    return (
        <ul className="menu menu-xs bg-base-200 rounded-box max-w-xs w-full">
            {nodes.map((node) => (
                <TreeNode key={node.marketGroupID} node={node} onClick={(g) => console.log(`Market Group ${g}` ) } />
            ))}
        </ul>
    );
};

interface TreeNodeProps {
    node: MarketGroupNode;
    onClick?: (marketGroupID: number) => void;
}

const TreeNode = ({ node, onClick }: TreeNodeProps) => {
    const hasChildren = node.children && node.children.length > 0;

    if (hasChildren) {
        return (
            <li>
                <details>
                    <summary>{node.marketGroupName}</summary>
                    <ul>
                        {node.children!.map((child) => (
                            <TreeNode key={child.marketGroupID} node={child} onClick={onClick} />
                        ))}
                    </ul>
                </details>
            </li>
        );
    }

    return (
        <li>
            <a
                onClick={() => {
                    if (onClick) onClick(node.marketGroupID);
                }}
                className="cursor-pointer"
            >
                {node.marketGroupName}
            </a>
        </li>
    );
};

export default MarketTree;