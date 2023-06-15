export function isError(error: unknown): error is Error {
  // @ts-ignore
  return "message" in error;
}
