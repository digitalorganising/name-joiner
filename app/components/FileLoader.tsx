"use client";

import Papa, { ParseResult } from "papaparse";
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

type Props = {
  id: string;
  label: string;
};

type State = "initial" | "loading" | "success" | "error";

export default function FileLoader({ id, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("initial");
  const [result, setResult] = useState<ParseResult<unknown> | undefined>(
    undefined
  );
  const [nameCol, setNameCol] = useState<string | undefined>(undefined);

  const clear = () => {
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
          setResult(result);
          setNameCol(
            result.meta.fields!.find((field) =>
              field.toLowerCase().includes("name")
            )
          );
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
        {state === "success" && result ? (
          <>
            <div className="italic text-sm mt-5 mb-3">
              Loaded <em className="font-bold">{result.data.length}</em> rows
            </div>
            <Label htmlFor={`${id}-name-col`}>Column for name</Label>
            <Select value={nameCol} onValueChange={setNameCol}>
              <SelectTrigger id={`${id}-name-col`}>
                <SelectValue placeholder="FLOP" />
              </SelectTrigger>
              <SelectContent>
                {result.meta.fields!.map((field) => (
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
