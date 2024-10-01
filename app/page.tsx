import NameJoiner from "../components/NameJoiner";

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl">
      <h1 className="text-4xl font-extrabold lg:text-5xl text-center my-10">
        Name Joiner
      </h1>
      <NameJoiner />
    </main>
  );
}
