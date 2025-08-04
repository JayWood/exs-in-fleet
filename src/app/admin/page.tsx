import PriceComparison from "@/components/client/PriceComparison";
import {getPriceComparison} from "@/app/api/market/priceCompare/route";
import {getMarketGroupTree} from "@/lib/db/market";
import {createProjection, readOne} from "@/lib/db/mongoHelpers";
import {cookies} from "next/headers";
import {PriceComparisonType, UserDocument} from "@/lib/db/collections";

const Page = async () => {
    const groups = await getMarketGroupTree();
    const cookieStore = await cookies();
    const characterCookie = cookieStore.get('character')?.value;
    const [,playerId] = characterCookie?.split('|') ?? [];

    const {settings} = await readOne<UserDocument>( 'eveUsers', {playerId: parseInt(playerId)}, createProjection(['settings']));
    return (
        <div className="w-full flex px-6 py-6">
            <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
                {/*<MarketTree nodes={groups} />*/}
                {
                    settings?.priceComparisons?.map( (comparison: PriceComparisonType, index: number) => (
                      <PriceComparison key={index} value={comparison} />
                    ))
                }
            </div>
        </div>
    )
};

export default Page;
