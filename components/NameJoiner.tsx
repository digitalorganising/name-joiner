"use client";

import { useMemo, useState } from "react";
import CSVLoader from "../components/CSVLoader";
import { Flavor, LoadedCSV } from "@/lib/types";
import { matchSubset } from "@/lib/joiner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const merge = useMemo(() => {
    if (staffCSV && membershipCSV) {
      const { matches, search } = matchSubset(staffCSV, membershipCSV);
      const matched = groupBy<"matchLevel", (typeof matches)[number]>(
        matches,
        (match) => match.matchLevel
      );
      return { matched, search };
    }
  }, [staffCSV?.nameField, membershipCSV?.nameField]);

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
          {merge && membershipCSV && staffCSV ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">
                  Potential matches
                </h3>
                <MembershipTable
                  className="border-amber-600 bg-amber-50"
                  rows={merge.matched["potential-match"] ?? []}
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
                          handleSelect={console.log}
                          getItemId={({ id }) => id}
                          renderItem={({ name }) => name}
                        />
                      ),
                    },
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">No match</h3>
                <MembershipTable
                  className="border-red-600 bg-red-50"
                  rows={merge.matched["no-match"] ?? []}
                  columns={[
                    {
                      accessorKey: "name",
                      header: "Name",
                    },
                    {
                      id: "search",
                      header: "Match",
                      cell: () => (
                        <AutoComplete
                          placeholder="Search for a match..."
                          prefilled={[]}
                          handleSearch={merge.search}
                          handleSelect={console.log}
                          getItemId={({ id }) => id}
                          renderItem={({ name }) => name}
                        />
                      ),
                    },
                  ]}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2 pl-0.5">Matches</h3>
                <MembershipTable
                  className="border-green-600 bg-green-50"
                  rows={merge.matched.unambiguous ?? []}
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
