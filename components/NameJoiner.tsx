"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircledIcon,
  ExitIcon,
  QuestionMarkIcon,
  CounterClockwiseClockIcon,
} from "@radix-ui/react-icons";

import CSVLoader from "../components/CSVLoader";
import { Flavor, LoadedCSV, ValueOf } from "@/lib/types";
import { MatchResult, Match, matchSubset } from "@/lib/merging";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import MembershipTable from "./MembershipTable";
import { groupBy } from "@/lib/utils";
import AutoComplete from "./AutoComplete";
import { CellContext } from "@tanstack/react-table";
import { rowStateMachine } from "@/lib/merging/state-machine";

type StaffListField = Flavor<string, "StaffList">;
type MembershipListField = Flavor<string, "MembershipList">;

export default function NameJoiner() {
  const [staffCSV, setStaffCSV] = useState<
    LoadedCSV<StaffListField> | undefined
  >(undefined);
  const [membershipCSV, setMembershipCSV] = useState<
    LoadedCSV<MembershipListField> | undefined
  >(undefined);
  const [merge, setMerge] = useState<
    MatchResult<MembershipListField, StaffListField> | undefined
  >(undefined);
  const [rowState, setRowState] = useState<
    Record<MembershipListField, Match<StaffListField>>
  >({});

  const transitionRowState = rowStateMachine(setMerge);

  useEffect(() => {
    if (staffCSV && membershipCSV) {
      const result = matchSubset(staffCSV, membershipCSV);
      setMerge(result);
    }
  }, [staffCSV?.nameField, membershipCSV?.nameField]);

  const groupedMerge = useMemo(() => {
    if (merge) {
      return groupBy<"matchLevel", ValueOf<(typeof merge)["matches"]>>(
        Array.from(merge.matches.values()),
        (r) => r.matchLevel
      );
    }
  }, [merge?.matches]);

  useEffect(() => {
    if (groupedMerge) {
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
    }
  }, [groupedMerge?.["potential-match"]]);

  const handleMatchSelect =
    <T, V>(props: CellContext<T, V>) =>
    (value?: (typeof rowState)[MembershipListField]) =>
      setRowState((state) => {
        if (value) {
          return { ...state, [props.row.id]: value };
        } else if (props.row.id in state) {
          delete state[props.row.id];
          return state;
        } else {
          return state;
        }
      });

  return (
    <>
      <section className="flex flex-col sm:flex-row justify-center align-center max-sm:space-y-4 sm:space-x-6">
        <CSVLoader
          id="staff-file"
          label="Staff List"
          csv={staffCSV}
          onLoaded={setStaffCSV}
        />
        <CSVLoader
          id="membership-file"
          label="Membership List"
          csv={membershipCSV}
          onLoaded={setMembershipCSV}
        />
      </section>
      <Card className="my-4 sm:my-6">
        <CardHeader>
          <CardTitle>Matched Membership</CardTitle>
          <CardDescription>
            Membership list with potential matches from the staff list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupedMerge && merge && membershipCSV && staffCSV ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">
                  Potential matches
                </h3>
                {groupedMerge["potential-match"] &&
                groupedMerge["potential-match"].length !== 0 ? (
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
                            value={rowState[props.row.id]}
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
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  "unambiguous"
                                )
                              }
                            >
                              <CheckCircledIcon className="mr-2 h-4 w-4" />{" "}
                              Confirm match
                            </Button>
                            <Button
                              title="Remove"
                              variant="destructive"
                              onClick={() =>
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  "removed"
                                )
                              }
                            >
                              <ExitIcon className="mr-2 h-4 w-4" /> Remove
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <span className="pl-0.5 text-sm text-muted-foreground">
                    Any potential matches have been resolved.
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">No match</h3>
                {groupedMerge["no-match"] &&
                groupedMerge["no-match"].length !== 0 ? (
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
                            value={rowState[props.row.id]}
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
                            {rowState[props.row.id] ? (
                              <Button
                                title="Confirm match"
                                className="bg-emerald-700 hover:bg-emerald-700/50"
                                onClick={() =>
                                  transitionRowState(
                                    props.row.original,
                                    rowState,
                                    "unambiguous"
                                  )
                                }
                              >
                                <CheckCircledIcon className="mr-2 h-4 w-4" />{" "}
                                Confirm match
                              </Button>
                            ) : null}
                            <Button
                              title="Remove"
                              variant="destructive"
                              onClick={() =>
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  "removed"
                                )
                              }
                            >
                              <ExitIcon className="mr-2 h-4 w-4" /> Remove
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <span className="pl-0.5 text-sm text-muted-foreground">
                    Any non-matching entries have been resolved.
                  </span>
                )}
              </div>

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
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  props.row.original.prevState.matchLevel
                                )
                              }
                            >
                              <CounterClockwiseClockIcon className="mr-2 h-4 w-4" />{" "}
                              Undo removal
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">Matches</h3>
                {groupedMerge.unambiguous &&
                groupedMerge.unambiguous.length !== 0 ? (
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
                        accessorFn: (row) =>
                          `${row.match.name} (${row.match.id})`,
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
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  "potential-match"
                                )
                              }
                            >
                              <QuestionMarkIcon className="mr-2 h-4 w-4" />{" "}
                              Incorrect match
                            </Button>
                            <Button
                              title="Remove"
                              variant="destructive"
                              onClick={() =>
                                transitionRowState(
                                  props.row.original,
                                  rowState,
                                  "removed"
                                )
                              }
                            >
                              <ExitIcon className="mr-2 h-4 w-4" /> Remove
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <span className="pl-0.5 text-sm text-muted-foreground">
                    There are no confirmed matches.
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
