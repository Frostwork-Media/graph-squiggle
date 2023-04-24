import { LocationRange } from "peggy";

export function getTextFromLocationRange(
  location: LocationRange,
  source: string
): string {
  try {
    const start = location.start;
    const end = location.end;
    const lines = source.split("\n");
    const startLine = lines[start.line - 1];
    const endLine = lines[end.line - 1];

    if (start.line === end.line) {
      const text = startLine.slice(start.column - 1, end.column - 1);
      return text;
    } else {
      const firstLineText = startLine.slice(start.column - 1);
      const middleLines = lines.slice(start.line, end.line - 1);
      const lastLineText = endLine.slice(0, end.column - 1);
      return [firstLineText, ...middleLines, lastLineText].join("\n");
    }
  } catch (error) {
    console.error({ error, location, source });
    return "";
  }
}
