import { EvePayload } from '@/lib/eve-auth'

export const imageBase: string = 'https://images.evetech.net'

type ImageOptions = {
    category: 'alliances' | 'corporations' | 'characters' | 'types'
    id: number
    variation: string
}

/**
 * Gets an image from the image server based on data provided.
 *
 * @link https://docs.esi.evetech.net/docs/image_server.html
 *
 * @param category
 * @param id
 * @param variation
 */
export function getImage({
    category,
    id,
    variation = '',
}: ImageOptions): string {
    return `${imageBase}/${category}/${id}/${variation}`
}
