import FileLoader from "./components/FileLoader";

export default function Home() {
  return (
    <main className="container mx-auto max-w-5xl">
      <h1 className="text-4xl font-extrabold lg:text-5xl text-center my-10">
        Name Joiner
      </h1>
      <section className="flex justify-center align-center space-x-6">
        <FileLoader id="primary-file" label="CSV 1: Main list" />
        <FileLoader id="secondary-file" label="CSV 2: Subset" />
      </section>
    </main>
  );
}
