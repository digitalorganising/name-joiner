"use client";

import Papa from "papaparse";
import { useRef, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { CSVRow, LoadedCSV } from "@/lib/types";

const emailRegex = new RegExp("^[^@]+@[^@]+.[^@]+$");

const findNameField = <Field extends string>(fields: Field[]): Field =>
  fields.find((field) => field.toLowerCase().includes("name")) ?? fields[0];

const findEmailField = <Field extends string>(
  fields: Field[],
  row: CSVRow<Field>
): Field | undefined => {
  const maybeEmailField = fields.find((f) => {
    const lc = f.toLowerCase();
    return lc === "email" || lc === "mail";
  });
  return (
    maybeEmailField ??
    (Object.values(row).find(
      (value) => typeof value === "string" && emailRegex.test(value)
    ) as Field | undefined)
  );
};

const findIdField = <Field extends string>(
  fields: Field[],
  row: CSVRow<Field>
): Field =>
  fields.find((f) => f === "id") ?? findEmailField(fields, row) ?? fields[0];

type Props<Field extends string> = {
  id: string;
  label: string;
  csv?: LoadedCSV<Field>;
  onLoaded: (csv?: LoadedCSV<Field>) => void;
};

type State = "initial" | "loading" | "success" | "error";

export default function CSVLoader<Field extends string>({
  id,
  label,
  csv,
  onLoaded,
}: Props<Field>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("initial");

  const clear = () => {
    onLoaded(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setState("initial");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState("loading");
      Papa.parse<CSVRow<Field>>(file, {
        header: true,
        skipEmptyLines: true,
        error: (e) => {
          console.error(e);
          setState("error");
        },
        complete: (result) => {
          const fields = result.meta.fields as Field[];
          onLoaded({
            data: result.data,
            fields,
            idField: findIdField(fields, result.data[0]),
            nameField: findNameField(fields as Field[]),
            emailField: findEmailField(fields, result.data[0]),
          });

          setState("success");
        },
      });
    }
  };

  return (
    <Card className="grow">
      <CardHeader>
        <Label className="font-bold text-lg" htmlFor={id}>
          {label}
        </Label>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            id={id}
            type="file"
            accept="text/csv"
            onChange={handleFile}
            ref={inputRef}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={clear}
            title="Clear file selection"
          >
            <Cross2Icon />
          </Button>
        </div>
        {state === "loading" ? "Loading..." : null}
        {state === "success" && csv ? (
          <>
            <div className="italic text-sm mt-5 mb-3">
              Loaded <em className="font-bold">{csv.data.length}</em> rows
            </div>
            <Label htmlFor={`${id}-name-col`}>Column for name</Label>
            <Select
              value={csv.nameField}
              onValueChange={(nameField) =>
                onLoaded({ ...csv, nameField: nameField as Field })
              }
            >
              <SelectTrigger id={`${id}-name-col`}>
                <SelectValue placeholder="Select a column for the name" />
              </SelectTrigger>
              <SelectContent>
                {csv.fields!.map((field) => (
                  <SelectItem value={field} key={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
