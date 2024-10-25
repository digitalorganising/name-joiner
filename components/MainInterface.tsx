"use client";

import { useState } from "react";

import CSVLoader from "./CSVLoader";
import { Flavor, LoadedCSV } from "@/lib/types";

import MergeCards from "./MergeCards";

type StaffListField = Flavor<string, "StaffList">;
type MembershipListField = Flavor<string, "MembershipList">;

export default function MainInterface() {
  const [staffCSV, setStaffCSV] = useState<
    LoadedCSV<StaffListField> | undefined
  >(undefined);
  const [membershipCSV, setMembershipCSV] = useState<
    LoadedCSV<MembershipListField> | undefined
  >(undefined);

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
      <section>
        {staffCSV && membershipCSV ? (
          <MergeCards
            superset={staffCSV}
            subset={membershipCSV}
            key={`${staffCSV.nameField}_${membershipCSV.nameField}`}
          />
        ) : null}
      </section>
    </>
  );
}
