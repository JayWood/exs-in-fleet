import { getMarketGroupTree } from '@/lib/db/market'
import { createProjection, readOne } from '@/lib/db/mongoHelpers'
import { cookies } from 'next/headers'
import { UserDocument } from '@/lib/db/collections'
import SectionPriceComparison from '@/components/client/PriceComparison/SectionPriceComparison'
import MarketTree from '@/components/client/MarketTree'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import SectionTools from '@/components/client/SectionTools'

const Page = async () => {
  const groups = await getMarketGroupTree()
  const cookieStore = await cookies()
  const characterCookie = cookieStore.get('character')?.value
  const [, playerId] = characterCookie?.split('|') ?? []

  const { settings } = await readOne<UserDocument>(
    'eveUsers',
    { playerId: parseInt(playerId) },
    createProjection(['settings'])
  )
  return (
    <>
      {/*<MarketTree nodes={groups}/>*/}
      <SectionTools />
      <SectionPriceComparison settings={settings} />
    </>
  )
}

export default Page
