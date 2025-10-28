import { useRouter } from "next/router";

const StatsPage = () => {
  const { id } = useRouter().query;
  return (
    <div>
      <h1>{id}</h1>
    </div>
  );
};

export default StatsPage;
