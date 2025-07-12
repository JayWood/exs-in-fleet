import PriceComparison from "@/components/client/PriceComparison";
import {getPriceComparison} from "@/app/api/market/priceCompare/route";
import MarketTree from "@/components/client/MarketTree";
import {getMarketGroupTree} from "@/lib/db/market";

const Page = async () => {
    const groups = await getMarketGroupTree();
    return (
        <div className="w-full flex px-6 py-6">
            <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
                <MarketTree nodes={groups}/>
                <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
                <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
                <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
                <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
            </div>
        </div>
    )
};

export default Page;
