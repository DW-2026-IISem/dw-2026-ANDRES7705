export function normalizePath(path: string): string {
  const trimmed = path.trim();
  const withLeadingSlash = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  const normalized = withLeadingSlash.replace(/\/+/g, "/");

  if (normalized === "/") {
    return "/";
  }

  return normalized.replace(/\/+$/, "");
}

export function resourcePathMatches(
  requestPath: string,
  resourcePattern: string
): boolean {
  const requestSegments = normalizePath(requestPath).split("/");
  const patternSegments = normalizePath(resourcePattern).split("/");

  if (requestSegments.length !== patternSegments.length) {
    return false;
  }

  return patternSegments.every((segment, index) => {
    if (segment.startsWith(":")) {
      return requestSegments[index].length > 0;
    }

    return segment === requestSegments[index];
  });
}
