"use client";

import { useState } from "react";
import CSVLoader, { LoadedCSV } from "../components/CSVLoader";
import JoinedTable from "./JoinedTable";

export default function NameJoiner() {
  const [primaryCSV, setPrimaryCSV] = useState<LoadedCSV | undefined>(
    undefined
  );
  const [secondaryCSV, setSecondaryCSV] = useState<LoadedCSV | undefined>(
    undefined
  );

  return (
    <>
      <section className="flex justify-center align-center space-x-6">
        <CSVLoader
          id="primary-file"
          label="CSV 1: Main list"
          csv={primaryCSV}
          onLoaded={setPrimaryCSV}
        />
        <CSVLoader
          id="secondary-file"
          label="CSV 2: Subset"
          csv={secondaryCSV}
          onLoaded={setSecondaryCSV}
        />
      </section>
      {primaryCSV && (
        <JoinedTable data={primaryCSV.data} fields={primaryCSV.fields} />
      )}
    </>
  );
}
