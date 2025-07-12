export type eveImageTypes = {
    category: 'alliances' | 'corporations' | 'characters' | 'types';
    id: string | number;
    variation?: 'render' | 'icon';
    size?: 32 | 64 | 128 | 256 | 512 | 1024;
}

/**
 * Gets the Image URL for eve items displayed in game.
 * @param category
 * @param id
 * @param variation
 * @param size
 */
export function eveImageUrl( { category, id, variation = 'icon', size = 32 }: eveImageTypes ) {
    const baseUrl = new URL('https://images.evetech.net/');
    baseUrl.pathname = `/${category}/${id}/${variation}`;
    baseUrl.searchParams.set( 'size', size?.toString() );

    return baseUrl.toString();
}