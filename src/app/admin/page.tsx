import PriceComparison from "@/components/client/PriceComparison";

const Page = () => (
  <div className="w-full flex px-6 py-6">
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <PriceComparison title={'Component Comparisons'} />
    </div>
  </div>
);

export default Page;
