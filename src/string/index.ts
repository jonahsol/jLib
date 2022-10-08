import { isTruthy } from "../functions";

export function capitaliseFirst(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}
export function lowercaseFirst(str: string) {
  return str.charAt(0).toLocaleLowerCase() + str.slice(1);
}

export function lowerCaseEq(s1?: string, s2?: string) {
  return s1 && s2 && s1.toLowerCase() === s2.toLowerCase();
}

export const compareStrings = (
  s1: string | undefined,
  s2: string | undefined
) => s1 && s2 && s1.toLocaleLowerCase().localeCompare(s2.toLocaleLowerCase());
export const stringsEq = (s1: string | undefined, s2: string | undefined) =>
  (!s1 && !s2) || compareStrings(s1, s2) === 0;

/**
 * Simple pluralise of @param {str}.
 */
export function pluralise(str: string) {
  if (str[str.length - 1] === "s") return str;
  if (str[str.length - 1] === "y") {
    // Pathological input
    if (str.length === 1) return `${str}s`;
    // Spelling rule:
    // https://www.teachstarter.com/au/teaching-resource/rules-for-plurals-s-es-ies-ves/
    if (vowels.has(str[str.length - 2])) return `${str}s`;
    else return `${str.slice(0, str.length - 1)}ies`;
  } else return `${str}s`;
}
export function pluraliseIfMany(str: string, xs: any[]) {
  if (xs.length > 1) return pluralise(str);
  else return str;
}

export function verbify(str: string, opts?: { pastTense?: boolean }) {
  if (opts?.pastTense) return str.concat("d");
  else return str.slice(0, str.length - 1).concat("ing");
}

const vowels = new Set(["a", "e", "i", "o", "u"]);
export function indefiniteArticle(str: string) {
  return str.length === 0 || vowels.has(str.slice(0, 1)) ? "an" : "a";
}

const prepositions = new Set(["of", "from", "a", "an", "the", "for"]);
export function capitaliseWordsFirst(str: string) {
  return str
    .split(" ")
    .map((word) => (prepositions.has(word) ? word : capitaliseFirst(word)))
    .join(" ");
}

export function isContentString(str?: string) {
  return str && str.length !== 0;
}
export function withEllipsis(x: string) {
  return `${x}...`;
}
export function asYesNo(x: any) {
  return isTruthy(x) ? "Yes" : "No";
}
