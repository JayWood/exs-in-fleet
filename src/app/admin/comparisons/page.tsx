import { createProjection, readOne } from '@/lib/db/mongoHelpers'
import { UserDocument } from '@/lib/db/collections'
import { cookies } from 'next/headers'
import SectionPriceComparison from '@/components/client/PriceComparison/SectionPriceComparison'

const Page = async () => {
  const cookieStore = await cookies()
  const characterCookie = cookieStore.get('character')?.value
  const [, playerId] = characterCookie?.split('|') ?? []

  const { settings } = await readOne<UserDocument>(
    'eveUsers',
    { playerId: parseInt(playerId) },
    createProjection(['settings'])
  )

  return <SectionPriceComparison settings={settings} />
}

export default Page
