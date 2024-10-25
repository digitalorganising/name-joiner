import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  CheckCircledIcon,
  ExitIcon,
  QuestionMarkIcon,
  CounterClockwiseClockIcon,
} from "@radix-ui/react-icons";

import { Button } from "./ui/button";
import { Match, MatchResult } from "@/lib/merging";
import { mergeStateMachine } from "@/lib/merging/state-machine";
import { groupBy } from "@/lib/utils";
import { CellContext } from "@tanstack/react-table";
import MembershipTable from "./MembershipTable";
import AutoComplete from "./AutoComplete";

type Props<SupersetField extends string, SubsetField extends string> = {
  merge: MatchResult<SubsetField, SupersetField>;
  setMerge: Dispatch<SetStateAction<MatchResult<SubsetField, SupersetField>>>;
};

export default function JoiningTables<
  SupersetField extends string,
  SubsetField extends string
>({ merge, setMerge }: Props<SupersetField, SubsetField>) {
  const [rowState, setRowState] = useState<
    Record<SubsetField, Match<SupersetField>>
  >({} as Record<SubsetField, Match<SupersetField>>);
  const transitionMergeState = mergeStateMachine(setMerge);

  const groupedMerge = useMemo(
    () =>
      groupBy<"matchLevel", (typeof merge.matches)[number]>(
        merge.matches,
        (r) => r.matchLevel
      ),
    [merge.matches]
  );

  useEffect(() => {
    setRowState((state) => ({
      ...state,
      ...groupedMerge?.["potential-match"]?.reduce(
        (accState, m) => ({
          ...accState,
          [m.id]: m.potentialMatches[0],
        }),
        {}
      ),
    }));
  }, [groupedMerge?.["potential-match"]]);

  const handleMatchSelect =
    <T, V>(props: CellContext<T, V>) =>
    (value?: (typeof rowState)[SubsetField]) =>
      setRowState((state) => {
        if (value) {
          return { ...state, [props.row.id]: value };
        } else if (props.row.id in state) {
          delete state[props.row.id as SubsetField];
          return state;
        } else {
          return state;
        }
      });

  return (
    <div className="space-y-6">
      {groupedMerge["potential-match"] &&
      groupedMerge["potential-match"].length !== 0 ? (
        <div>
          <h3 className="text-sm font-bold mb-2 pl-0.5">Potential matches</h3>

          <MembershipTable
            className="border-amber-600 bg-amber-50"
            rows={groupedMerge["potential-match"]}
            columns={[
              {
                accessorKey: "name",
                header: "Name",
              },
              {
                id: "potentialMatches",
                header: "Potential matches",
                cell: (props) => (
                  <AutoComplete
                    placeholder="Select a match"
                    prefilled={props.row.original.potentialMatches}
                    handleSearch={merge.search}
                    value={rowState[props.row.id as SubsetField]}
                    handleSelect={handleMatchSelect(props)}
                    getItemId={({ id }) => id}
                    renderItem={({ name }) => name}
                  />
                ),
              },
              {
                id: "action",
                header: () => null,
                cell: (props) => (
                  <div className="space-x-2 flex justify-end">
                    <Button
                      title="Confirm match"
                      className="bg-emerald-700 hover:bg-emerald-700/50"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          "unambiguous"
                        )
                      }
                    >
                      <CheckCircledIcon /> Confirm match
                    </Button>
                    <Button
                      title="Remove"
                      variant="destructive"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          "removed"
                        )
                      }
                    >
                      <ExitIcon /> Remove
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ) : null}
      {groupedMerge["no-match"] && groupedMerge["no-match"].length !== 0 ? (
        <div>
          <h3 className="text-sm font-bold mb-2 pl-0.5">No match</h3>
          <MembershipTable
            className="border-red-600 bg-red-50"
            rows={groupedMerge["no-match"] ?? []}
            columns={[
              {
                accessorKey: "name",
                header: "Name",
              },
              {
                id: "search",
                header: "Potential matches",
                cell: (props) => (
                  <AutoComplete
                    placeholder="Input a match"
                    prefilled={[]}
                    handleSearch={merge.search}
                    value={rowState[props.row.id as SubsetField]}
                    handleSelect={handleMatchSelect(props)}
                    getItemId={({ id }) => id}
                    renderItem={({ name }) => name}
                  />
                ),
              },
              {
                id: "action",
                header: () => null,
                cell: (props) => (
                  <div className="space-x-2 flex justify-end">
                    {rowState[props.row.id as SubsetField] ? (
                      <Button
                        title="Confirm match"
                        className="bg-emerald-700 hover:bg-emerald-700/50"
                        onClick={() =>
                          transitionMergeState(
                            props.row.original,
                            rowState,
                            "unambiguous"
                          )
                        }
                      >
                        <CheckCircledIcon /> Confirm match
                      </Button>
                    ) : null}
                    <Button
                      title="Remove"
                      variant="destructive"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          "removed"
                        )
                      }
                    >
                      <ExitIcon /> Remove
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          )
        </div>
      ) : null}

      {groupedMerge.removed && groupedMerge.removed.length !== 0 ? (
        <div>
          <h3 className="text-sm font-bold mb-2 pl-0.5">Removed</h3>
          <MembershipTable
            className="border-slate-700 bg-slate-50"
            rows={groupedMerge.removed}
            columns={[
              {
                accessorKey: "name",
                header: "Name",
              },
              {
                id: "action",
                header: () => null,
                cell: (props) => (
                  <div className="space-x-2 flex justify-end">
                    <Button
                      variant="outline"
                      title="Undo removal"
                      className="border-primary"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          props.row.original.prevState.matchLevel
                        )
                      }
                    >
                      <CounterClockwiseClockIcon /> Undo removal
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ) : null}
      {groupedMerge.unambiguous && groupedMerge.unambiguous.length !== 0 ? (
        <div>
          <h3 className="text-sm font-bold mb-2 pl-0.5">Matches</h3>

          <MembershipTable
            className="border-green-600 bg-green-50"
            rows={groupedMerge.unambiguous}
            columns={[
              {
                accessorKey: "name",
                header: "Name",
              },
              {
                id: "match",
                accessorFn: (row) => `${row.match.name} (${row.match.id})`,
                header: "Match",
              },
              {
                id: "action",
                header: () => null,
                cell: (props) => (
                  <div className="space-x-2 flex justify-end">
                    <Button
                      variant="outline"
                      title="Incorrect match"
                      className="border-primary"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          "potential-match"
                        )
                      }
                    >
                      <QuestionMarkIcon /> Incorrect match
                    </Button>
                    <Button
                      title="Remove"
                      variant="destructive"
                      onClick={() =>
                        transitionMergeState(
                          props.row.original,
                          rowState,
                          "removed"
                        )
                      }
                    >
                      <ExitIcon /> Remove
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
