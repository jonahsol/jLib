export function isOk(resp: Response) {
  return resp.status.toString().charAt(0) === "2";
}

export function getScrollToElementId(id: string) {
  return `scrollTo-${id}`;
}
// Same argument as `getScrollToElementId`
export function scrollTo(id: string) {
  const x = getScrollToElementId(id);
  const y = document.getElementById(x);
  document.getElementById(getScrollToElementId(id)).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function throwDevError(message?: string) {
  throw new Error(`Developer error${message ? `: ${message}` : ""}`);
}
export function throwUnimplementedException(message?: string) {
  throw new Error(`Unimplemented exception${message ? `: ${message}` : ""}`);
}

export const dateInputDayjsFormat = "YYYY-MM-DD";
