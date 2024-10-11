import { Match, MatchedRow, MatchLevel, MatchResult } from "./types";

export function rowStateMachine<Primary extends string, Foreign extends string>(
  setMerge: (
    updater: (
      state: MatchResult<Primary, Foreign> | undefined
    ) => MatchResult<Primary, Foreign> | undefined
  ) => void
) {
  return (
    row: MatchedRow<Primary, Foreign>,
    rowState: Record<Primary, Match<Foreign>>,
    transitionTo?: MatchLevel
  ) => {
    if (row.matchLevel === "potential-match") {
      if (transitionTo === "removed") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "removed",
                id: row.id,
                data: row.data,
                name: row.name,
                prevState: row,
              }),
            }
        );
      } else if (transitionTo === "unambiguous") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "unambiguous",
                id: row.id,
                data: row.data,
                name: row.name,
                match: rowState[row.id],
              }),
            }
        );
      }
    } else if (row.matchLevel === "unambiguous") {
      if (transitionTo === "potential-match") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "potential-match",
                id: row.id,
                data: row.data,
                name: row.name,
                potentialMatches: [row.match],
              }),
            }
        );
      } else if (transitionTo === "removed") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "removed",
                id: row.id,
                data: row.data,
                name: row.name,
                prevState: row,
              }),
            }
        );
      }
    } else if (row.matchLevel === "no-match") {
      if (transitionTo === "removed") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "removed",
                id: row.id,
                data: row.data,
                name: row.name,
                prevState: row,
              }),
            }
        );
      } else if (transitionTo === "unambiguous") {
        return setMerge(
          (prev) =>
            prev && {
              ...prev,
              matches: new Map(prev.matches).set(row.id, {
                matchLevel: "unambiguous",
                id: row.id,
                data: row.data,
                name: row.name,
                match: rowState[row.id],
              }),
            }
        );
      }
    } else if (row.matchLevel === "removed") {
      return setMerge(
        (prev) =>
          prev && {
            ...prev,
            matches: new Map(prev.matches).set(row.id, row.prevState),
          }
      );
    }
    throw new Error(
      `Invalid state transition for ${JSON.stringify(row)} to '${transitionTo}'`
    );
  };
}
