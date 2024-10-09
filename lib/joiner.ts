import * as ASCIIFolding from "fold-to-ascii";
import { LoadedCSV, CSVRow } from "./types";
import MiniSearch, { Query, SearchResult } from "minisearch";

const normalizeName = (name: string): string => {
  const folded = ASCIIFolding.foldReplacing(name);
  return folded.toLowerCase();
};

const isUnambiguous = (result: SearchResult): boolean => {
  return (
    result.terms.length === result.queryTerms.length &&
    result.queryTerms.every((term, i) => result.terms[i] === term)
  );
};

type Match<Id> = {
  id: Id;
  name: string;
};

export type UnambiguousMatchedRow<
  DataFields extends string,
  Id extends string = string
> = {
  matchLevel: "unambiguous";
  data: CSVRow<DataFields>;
  name: string;
  match: Match<Id>;
};

export type PotentialMatchedRow<
  DataFields extends string,
  Id extends string = string
> = {
  matchLevel: "potential-match";
  data: CSVRow<DataFields>;
  name: string;
  potentialMatches: Match<Id>[];
};

export type UnmatchedRow<DataFields extends string> = {
  matchLevel: "no-match";
  data: CSVRow<DataFields>;
  name: string;
};

export type MatchedRow<DataFields extends string, Id extends string = string> =
  | UnambiguousMatchedRow<DataFields, Id>
  | PotentialMatchedRow<DataFields, Id>
  | UnmatchedRow<DataFields>;

type MatchResult<
  PrimaryFields extends string,
  SecondaryFields extends string
> = {
  matches: MatchedRow<SecondaryFields, PrimaryFields>[];
  search: (query: string) => Match<PrimaryFields>[];
};

export const matchSubset = <
  PrimaryFields extends string,
  SecondaryFields extends string
>(
  primary: LoadedCSV<PrimaryFields>,
  secondary: LoadedCSV<SecondaryFields>
): MatchResult<PrimaryFields, SecondaryFields> => {
  const queryFields = [primary.nameField, primary.emailField].filter(
    (f): f is PrimaryFields => f !== undefined
  );
  const primaryMiniSearch = new MiniSearch({
    fields: queryFields,
    storeFields: queryFields,
    idField: primary.idField,
    tokenize: (text, fieldName) => text.split(" "),
    processTerm: (term, fieldName) =>
      fieldName === primary.nameField
        ? normalizeName(term)
        : term.toLowerCase(),
  });
  const cleanedPrimaryData = primary.data.filter((d) => !!d[primary.idField]);
  if (cleanedPrimaryData.length !== primary.data.length) {
    console.log(
      `Removed ${
        primary.data.length - cleanedPrimaryData.length
      } rows from the index which did not have an ID`
    );
  }
  primaryMiniSearch.addAll(cleanedPrimaryData);

  const createQuery = (name: string, email?: string): Query => ({
    combineWith: "OR",
    queries: [
      {
        fields: [primary.nameField],
        fuzzy: 0.2,
        queries: [name],
      } as Query,
      email && primary.emailField
        ? {
            fields: [primary.emailField],
            queries: [email],
          }
        : undefined,
    ].filter((q): q is Query => q !== undefined),
  });

  const toMatch = (r: SearchResult) => ({
    id: r.id as PrimaryFields,
    name: r[primary.nameField],
  });

  const matches = secondary.data.map((row) => {
    const name = row[secondary.nameField]!.toString();
    const email = secondary.emailField && row[secondary.emailField]?.toString();
    const searchResults = primaryMiniSearch.search(createQuery(name, email));

    if (searchResults.length === 0) {
      return {
        matchLevel: "no-match" as const,
        data: row,
        name,
      };
    } else if (isUnambiguous(searchResults[0])) {
      return {
        matchLevel: "unambiguous" as const,
        data: row,
        name,
        match: toMatch(searchResults[0]),
      };
    } else {
      return {
        matchLevel: "potential-match" as const,
        data: row,
        name,
        potentialMatches: searchResults.map(toMatch),
      };
    }
  });

  return {
    search: (query) =>
      primaryMiniSearch.search(query, { prefix: true }).map(toMatch),
    matches,
  };
};
