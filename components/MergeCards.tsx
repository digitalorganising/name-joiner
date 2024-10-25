import { useMemo, useState } from "react";
import {
  ArchiveIcon,
  DownloadIcon,
  ExclamationTriangleIcon,
  FileMinusIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { LoadedCSV } from "@/lib/types";
import JoiningTables from "./JoiningTables";
import { MatchResult, matchSubset } from "@/lib/merging";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { saveCSV } from "@/lib/io";
import { mergeNamespaced } from "@/lib/utils";
import SaveProgressDialog from "./SaveProgressDialog";

type Props<SupersetField extends string, SubsetField extends string> = {
  superset: LoadedCSV<SupersetField>;
  subset: LoadedCSV<SubsetField>;
};

export default function MergeCards<
  SupersetField extends string,
  SubsetField extends string
>({ superset, subset }: Props<SupersetField, SubsetField>) {
  const [merge, setMerge] = useState<MatchResult<SubsetField, SupersetField>>(
    () => matchSubset(superset, subset)
  );

  const mergeState = useMemo(
    () =>
      merge.matches.reduce(
        (totals, m) => {
          if (
            m.matchLevel === "potential-match" ||
            m.matchLevel === "no-match"
          ) {
            return {
              ...totals,
              incomplete: totals.incomplete + 1,
            };
          } else if (m.matchLevel === "removed") {
            return {
              ...totals,
              removed: totals.removed + 1,
            };
          }
          return totals;
        },
        {
          incomplete: 0,
          removed: 0,
        }
      ),
    [merge.matches]
  );

  const exportMatched = () => {
    const invertedMatches = new Map(
      merge.matches.flatMap((row) =>
        row.matchLevel === "unambiguous" ? [[row.match.id, row.data]] : []
      )
    );
    const blankMemberRow = Object.fromEntries(
      Object.keys(merge.matches[0].data).map((key) => [key, undefined])
    );
    return saveCSV(
      "matched-membership.csv",
      superset.data.map((staffRow) => {
        const id = staffRow[superset.idField] as SupersetField;
        return mergeNamespaced({
          staff: staffRow,
          member: invertedMatches.get(id) ?? blankMemberRow,
        });
      })
    );
  };

  return (
    <>
      <Card className="my-4 sm:my-6 relative">
        <CardHeader>
          <CardTitle>Matched Membership</CardTitle>
          <CardDescription>
            Membership list with potential matches from the staff list.
          </CardDescription>
        </CardHeader>
        <SaveProgressDialog state={merge} hydrateState={setMerge}>
          <Button
            variant="outline"
            title="Save/load progress"
            className="absolute top-6 right-6 w-10 h-10"
          >
            <ArchiveIcon />
          </Button>
        </SaveProgressDialog>
        <CardContent>
          <JoiningTables merge={merge} setMerge={setMerge} />
        </CardContent>
      </Card>
      <Card className="my-4 sm:my-6">
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>
            Export the full staff list with matches merged in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mergeState.incomplete > 0 ? (
            <Alert>
              <ExclamationTriangleIcon />
              <AlertTitle>Unresolved entries</AlertTitle>
              <AlertDescription>
                Potential matches and unmatched entries must be resolved before
                you can create an export.
              </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={exportMatched} title="Export merged lists">
              <DownloadIcon />
              Export merged lists
            </Button>
          )}
          {mergeState.removed > 0 ? (
            <Button
              onClick={() =>
                saveCSV(
                  "removed-members.csv",
                  merge.matches.flatMap((m) =>
                    m.matchLevel === "removed" ? [m.data] : []
                  )
                )
              }
              title="Export removed members"
              variant="outline"
              className="my-2"
            >
              <FileMinusIcon />
              Export removed members list
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
