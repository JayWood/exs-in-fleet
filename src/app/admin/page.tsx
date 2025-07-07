import PriceComparison from "@/components/client/PriceComparison";
import {getPriceComparison} from "@/app/api/market/priceCompare/route";

const Page = () => (
  <div className="w-full flex px-6 py-6">
    <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2">
      <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
      <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
      <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
      <PriceComparison title={'Component Comparisons'} prices={getPriceComparison()} sourceSystem={{name: "Jita"}} targetSystem={{name: "UALX"}} />
    </div>
  </div>
);

export default Page;
