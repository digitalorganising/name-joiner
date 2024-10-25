import { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { DownloadIcon, GlobeIcon, UploadIcon } from "@radix-ui/react-icons";
import { loadFile, saveFile } from "@/lib/io";

type Props = {
  children: ReactNode;
  state: any;
  hydrateState: (state: any) => void;
};

const storageKey = "NAME_JOINER";

const serialize = (obj: any): string => btoa(JSON.stringify(obj));

const deserialize = (str: string): any => JSON.parse(atob(str));

export default function SaveProgressDialog({
  children,
  state,
  hydrateState,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save/load progress</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Save or load matching progress here, either by downloading a
              shareable file or by saving to your browser.
            </p>
            <p>Don't save to your browser on a shared computer!</p>
            <p>
              You will need your original CSV files in order to load previously
              saved progress
            </p>
          </DialogDescription>
        </DialogHeader>
        <Button
          title="Save progress file"
          onClick={() => saveFile("match-progress.state", serialize(state))}
        >
          <DownloadIcon />
          Save progress file
        </Button>
        <Button
          title="Save progress in browser"
          onClick={() => {
            localStorage.setItem(storageKey, serialize(state));
          }}
        >
          <GlobeIcon />
          Save progress in browser
        </Button>
        <hr />
        <Button
          variant="outline"
          title="Load progress file"
          onClick={() => loadFile().then(deserialize).then(hydrateState)}
        >
          <UploadIcon />
          Load progress file
        </Button>
        <Button
          variant="outline"
          title="Load progress from browser"
          onClick={() => {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              hydrateState(deserialize(stored));
            }
          }}
        >
          <GlobeIcon />
          Load progress from browser
        </Button>
      </DialogContent>
    </Dialog>
  );
}
