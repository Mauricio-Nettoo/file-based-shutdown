export const sleep: (ms: number) => Promise<unknown> = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));
