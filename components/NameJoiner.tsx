"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircledIcon,
  ExitIcon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";

import CSVLoader from "../components/CSVLoader";
import { Flavor, LoadedCSV, ValueOf } from "@/lib/types";
import { MatchResult, Match, matchSubset } from "@/lib/joiner";
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
    MatchResult<StaffListField, MembershipListField> | undefined
  >(undefined);
  const [rowState, setRowState] = useState<
    Record<MembershipListField, Match<StaffListField>>
  >({});

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
  }, [merge]);

  useEffect(() => {
    if (groupedMerge && membershipCSV?.idField) {
      setRowState((state) => ({
        ...state,
        ...groupedMerge?.["potential-match"].reduce(
          (accState, m) => ({
            ...accState,
            [m.data[membershipCSV.idField] as string]: m.potentialMatches[0],
          }),
          {}
        ),
      }));
    }
  }, [groupedMerge?.["potential-match"]]);

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
          {groupedMerge && membershipCSV && staffCSV ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">
                  Potential matches
                </h3>
                <MembershipTable
                  idField={membershipCSV.idField}
                  className="border-amber-600 bg-amber-50"
                  rows={groupedMerge["potential-match"] ?? []}
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
                          handleSelect={(value) =>
                            setRowState((state) => {
                              if (value) {
                                return { ...state, [props.row.id]: value };
                              } else if (props.row.id in state) {
                                delete state[props.row.id];
                                return state;
                              } else {
                                return state;
                              }
                            })
                          }
                          getItemId={({ id }) => id}
                          renderItem={({ name }) => name}
                        />
                      ),
                    },
                    {
                      id: "action",
                      header: "Action",
                      cell: () => (
                        <div className="space-x-2">
                          <Button
                            title="Confirm match"
                            className="bg-emerald-700 hover:bg-emerald-700/50"
                          >
                            <CheckCircledIcon className="mr-2 h-4 w-4" />{" "}
                            Confirm match
                          </Button>
                          <Button title="Remove match" variant="destructive">
                            <ExitIcon className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">No match</h3>
                <MembershipTable
                  idField={membershipCSV.idField}
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
                          handleSelect={(value) =>
                            setRowState((state) => {
                              if (value) {
                                return { ...state, [props.row.id]: value };
                              } else if (props.row.id in state) {
                                delete state[props.row.id];
                                return state;
                              } else {
                                return state;
                              }
                            })
                          }
                          getItemId={({ id }) => id}
                          renderItem={({ name }) => name}
                        />
                      ),
                    },
                    {
                      id: "action",
                      header: "Action",
                      cell: () => (
                        <Button title="Confirm no match" variant="destructive">
                          <ExitIcon className="mr-2 h-4 w-4" /> Confirm no match
                        </Button>
                      ),
                    },
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">Matches</h3>
                <MembershipTable
                  idField={membershipCSV.idField}
                  className="border-green-600 bg-green-50"
                  rows={groupedMerge.unambiguous ?? []}
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
                      header: "Action",
                      cell: () => (
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Question match validity"
                            className="border-primary"
                          >
                            <QuestionMarkIcon />
                          </Button>
                          <Button
                            title="Remove match"
                            variant="destructive"
                            size="icon"
                          >
                            <ExitIcon />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
