import {IndustryActivityMaterial} from "@/lib/db/collections";

export type eveImageTypes = {
    category: 'alliances' | 'corporations' | 'characters' | 'types';
    id: string | number;
    variation?: 'render' | 'icon' | 'portrait';
    size?: 32 | 64 | 128 | 256 | 512 | 1024;
}

/**
 * Gets the Image URL for eve items displayed in game.
 * @param category
 * @param id
 * @param variation
 * @param size
 */
export function eveImageUrl({category, id, variation = 'icon', size = 32}: eveImageTypes) {
    const baseUrl = new URL('https://images.evetech.net/');
    baseUrl.pathname = `/${category}/${id}/${variation}`;
    baseUrl.searchParams.set('size', size?.toString());

    return baseUrl.toString();
}

export interface MaterialCostInput {
    baseQty: number;         // Base material requirement from the BPO
    bpME: number;           // Blueprint Material Efficiency (e.g., 0.10 for 10%)
    structureME: number;     // Structure Material Efficiency (e.g., 0.025 for 2.5%)
}

/**
 * Calculates the material input quantity taking into account bonuses.
 * @param baseQty
 * @param bpoME
 * @param structureME
 */
export function calcInputQty( {
        baseQty,
        bpME,
        structureME,
    }: MaterialCostInput ): number
{
    return Math.ceil(
        baseQty * (1 - bpME) * (1 - structureME)
    );
}

/**
 * Calculates a whole list of IndustryActivityMaterial documents.
 * @param materials
 * @param bpME
 * @param structureME
 */
export function calcIndustryActivityMaterials( materials: IndustryActivityMaterial[], bpME: number, structureME: number ): IndustryActivityMaterial[] {
    return materials.map( material => { return {
        ...material,
        quantity: calcInputQty({baseQty: material.quantity, bpME, structureME} )
    } } );
}
