import Papa from "papaparse";

export const saveCSV = async <T>(name: string, rows: T[]) => {
  const csv = Papa.unparse(rows);

  if ("showSaveFilePicker" in window) {
    const handle = await window.showSaveFilePicker({
      suggestedName: name,
      types: [
        {
          description: "CSV (Comma-separated values)",
          accept: { "text/csv": [".csv"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(csv);
    await writable.close();
  } else {
    const element = document.createElement("a");
    const url = URL.createObjectURL(new Blob([csv]));
    document.body.appendChild(element);
    element.href = url;
    element.download = name;
    element.click();
    element.remove();
    URL.revokeObjectURL(url);
  }
};
