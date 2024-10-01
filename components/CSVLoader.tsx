"use client";

import Papa from "papaparse";
import { useRef, useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
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

export type LoadedCSV = {
  data: any[];
  fields: string[];
  nameField?: string;
};

type Props = {
  id: string;
  label: string;
  csv?: LoadedCSV;
  onLoaded: (csv?: LoadedCSV) => void;
};

type State = "initial" | "loading" | "success" | "error";

export default function CSVLoader({ id, label, csv, onLoaded }: Props) {
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
      Papa.parse(file, {
        header: true,
        error: (e) => {
          console.error(e);
          setState("error");
        },
        complete: (result) => {
          onLoaded({
            data: result.data,
            fields: result.meta.fields!,
            nameField: result.meta.fields!.find((field) =>
              field.toLowerCase().includes("name")
            ),
          });

          setState("success");
        },
      });
    }
  };

  return (
    <Card>
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
          <Button variant="outline" size="icon" onClick={clear}>
            <TrashIcon />
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
              onValueChange={(nameField) => onLoaded({ ...csv, nameField })}
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
