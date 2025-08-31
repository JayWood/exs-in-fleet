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

  return (
    <>
      {/*<MarketTree nodes={groups}/>*/}
      <SectionTools />
    </>
  )
}

export default Page
