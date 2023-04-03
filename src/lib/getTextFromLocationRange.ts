import { LocationRange } from "peggy";

export function getTextFromLocationRange(
  location: LocationRange,
  source: string
): string {
  const start = location.start;
  const end = location.end;
  const lines = source.split("\n");
  const line = lines[start.line - 1];
  const text = line.slice(start.column - 1, end.column - 1);
  return text;
}
