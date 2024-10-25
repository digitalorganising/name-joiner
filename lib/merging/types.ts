import { CSVRow } from "../types";

export type Match<Id> = {
  id: Id;
  name: string;
};

export type UnambiguousMatchedRow<
  DataFields extends string,
  ForeignId extends string
> = {
  matchLevel: "unambiguous";
  id: DataFields;
  data: CSVRow<DataFields>;
  name: string;
  match: Match<ForeignId>;
};

export type PotentialMatchedRow<
  DataFields extends string,
  ForeignId extends string
> = {
  matchLevel: "potential-match";
  id: DataFields;
  data: CSVRow<DataFields>;
  name: string;
  potentialMatches: Match<ForeignId>[];
};

export type UnmatchedRow<DataFields extends string> = {
  matchLevel: "no-match";
  id: DataFields;
  data: CSVRow<DataFields>;
  name: string;
};

export type RemovedRow<DataFields extends string, ForeignId extends string> = {
  matchLevel: "removed";
  id: DataFields;
  data: CSVRow<DataFields>;
  name: string;
  prevState: MatchedRow<DataFields, ForeignId>;
};

export type MatchedRow<DataFields extends string, ForeignId extends string> =
  | UnambiguousMatchedRow<DataFields, ForeignId>
  | PotentialMatchedRow<DataFields, ForeignId>
  | UnmatchedRow<DataFields>
  | RemovedRow<DataFields, ForeignId>;

export type MatchLevel = MatchedRow<any, any>["matchLevel"];

export type MatchResult<
  SubsetField extends string,
  SupersetField extends string
> = {
  matches: MatchedRow<SubsetField, SupersetField>[];
  search: (query: string) => Match<SupersetField>[];
};
