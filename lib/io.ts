import Papa from "papaparse";

export const saveFile = async (
  name: string,
  contents: string,
  types?: FilePickerAcceptType[]
) => {
  if ("showSaveFilePicker" in window) {
    const handle = await window.showSaveFilePicker({
      suggestedName: name,
      types,
    });
    const writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
  } else {
    const element = document.createElement("a");
    const url = URL.createObjectURL(new Blob([contents]));
    document.body.appendChild(element);
    element.href = url;
    element.download = name;
    element.click();
    element.remove();
    URL.revokeObjectURL(url);
  }
};

export const saveCSV = async <T>(name: string, rows: T[]) => {
  const csv = Papa.unparse(rows);
  return saveFile(name, csv, [
    {
      description: "CSV (Comma-separated values)",
      accept: { "text/csv": [".csv"] },
    },
  ]);
};

export const loadFile = async () => {
  if ("showOpenFilePicker" in window) {
    const [handle] = await window.showOpenFilePicker();
    const file = await handle.getFile();
    return file.text();
  } else {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    document.body.appendChild(input);
    return new Promise<string>((resolve) => {
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        input.remove();
        if (file) {
          resolve(file.text());
        }
      });
      input.click();
    });
  }
};
