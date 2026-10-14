"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
exports.resourcePathMatches = resourcePathMatches;
function normalizePath(path) {
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
function resourcePathMatches(requestPath, resourcePattern) {
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
//# sourceMappingURL=resource-match.js.map