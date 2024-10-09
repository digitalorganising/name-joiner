import NameJoiner from "../components/NameJoiner";

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl p-4">
      <h1 className="text-3xl font-extrabold lg:text-4xl text-center my-8">
        Membership-to-staff matcher
      </h1>
      <NameJoiner />
    </main>
  );
}
