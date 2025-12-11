const Title = ({ character }: { character: Character }) => {
  return <div>
    <h1>{character.name}</h1>
  </div>;
};

export default Title;
