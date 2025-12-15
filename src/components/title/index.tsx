import { useDomainStore } from "@/domainStore/useDomainStore";

const Title = () => {
  const name = useDomainStore(store => store.getCharacterName());
  return <div>
    <h1>{name ?? 'Untitled'}</h1>
  </div>;
};

export default Title;
