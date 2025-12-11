const DataViewer = ({ power }: { power?: Power }) => {
  if (!power) return;

  return (
    <div>
      <h1>Data Viewer</h1>
      <span>{power.name}</span>
    </div>
  );
};

export default DataViewer;
