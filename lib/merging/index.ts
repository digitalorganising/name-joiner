import * as ASCIIFolding from "fold-to-ascii";
import MiniSearch, { Query, SearchResult } from "minisearch";
import { LoadedCSV } from "../types";
import { MatchedRow, MatchResult } from "./types";

const normalizeName = (name: string): string => {
  const folded = ASCIIFolding.foldReplacing(name);
  return folded.toLowerCase();
};

const isUnambiguous = (resultName: string, name: string): boolean =>
  normalizeName(resultName) === normalizeName(name);

const edgeNGrammer =
  (min: number, max: number) =>
  (term: string): string[] => {
    const tokens: string[] = [term];
    for (let i = min; i <= max; i++) {
      const token = term.slice(0, i);
      if (token === term) {
        break;
      }
      tokens.push(token);
    }
    return tokens;
  };

const namePrefixNGrammer = edgeNGrammer(3, 5);
const nameAnalyzer = (term: string) => namePrefixNGrammer(normalizeName(term));

export const matchSubset = <
  SupersetField extends string,
  SubsetField extends string
>(
  superset: LoadedCSV<SupersetField>,
  subset: LoadedCSV<SubsetField>
): MatchResult<SubsetField, SupersetField> => {
  const queryFields = [superset.nameField, superset.emailField].filter(
    (f): f is SupersetField => f !== undefined
  );
  const primaryMiniSearch = new MiniSearch({
    fields: queryFields,
    storeFields: queryFields,
    idField: superset.idField,
    tokenize: (text, fieldName) => text.split(" "),
    processTerm: (term, fieldName) =>
      fieldName === superset.nameField
        ? nameAnalyzer(term)
        : term.toLowerCase(),
  });
  const cleanedPrimaryData = superset.data.filter((d) => !!d[superset.idField]);
  if (cleanedPrimaryData.length !== superset.data.length) {
    console.log(
      `Removed ${
        superset.data.length - cleanedPrimaryData.length
      } rows from the index which did not have an ID`
    );
  }
  primaryMiniSearch.addAll(cleanedPrimaryData);

  const createQuery = (name: string, email?: string): Query => ({
    combineWith: "OR",
    queries: [
      {
        fields: [superset.nameField],
        fuzzy: (term) => (term.length > 3 ? 0.2 : null),
        queries: [name],
        processTerm: nameAnalyzer,
      } as Query,
      email && superset.emailField
        ? {
            fields: [superset.emailField],
            queries: [email],
          }
        : undefined,
    ].filter((q): q is Query => q !== undefined),
  });

  const toMatch = (r: SearchResult) => ({
    id: r.id as SupersetField,
    name: r[superset.nameField],
  });

  const matches = new Map<SubsetField, MatchedRow<SubsetField, SupersetField>>(
    subset.data.map((row, i) => {
      const id = row[subset.idField] as SubsetField;
      const name = row[subset.nameField]!.toString();
      const email = subset.emailField && row[subset.emailField]?.toString();
      const searchResults = primaryMiniSearch
        .search(createQuery(name, email))
        .slice(0, 10);

      if (searchResults.length === 0) {
        return [
          id,
          {
            matchLevel: "no-match" as const,
            data: row,
            id,
            name,
          },
        ];
      } else if (isUnambiguous(searchResults[0].displayName, name)) {
        return [
          id,
          {
            matchLevel: "unambiguous" as const,
            data: row,
            name,
            id,
            match: toMatch(searchResults[0]),
          },
        ];
      } else {
        return [
          id,
          {
            matchLevel: "potential-match" as const,
            data: row,
            name,
            id,
            potentialMatches: searchResults.map(toMatch),
          },
        ];
      }
    })
  );

  return {
    search: (query) =>
      primaryMiniSearch.search(query, { prefix: true }).map(toMatch),
    matches,
  };
};

export * from "./types";
