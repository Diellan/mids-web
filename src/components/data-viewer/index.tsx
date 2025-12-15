import { useDomainStore } from "@/domainStore/useDomainStore";

const DataViewer = () => {
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());

  return (
    <div>
      <h1>Data Viewer</h1>
      <span>{highlightedPower?.Power?.DisplayName}</span>
    </div>
  );
};

export default DataViewer;
