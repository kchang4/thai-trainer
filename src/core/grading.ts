export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s'-]+/g, "");
}

export function gradeTypedAnswer(expected: string, actual: string): boolean {
  return normalizeAnswer(expected) === normalizeAnswer(actual);
}
