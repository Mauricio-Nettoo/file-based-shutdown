export function convertTimeStringToNumberSecondsSyncV1(
  textTime: string,
): number {
  const hours: number = Number(textTime.match(/(\d+)h/)?.[1] ?? 0);
  const minutes: number = Number(textTime.match(/(\d+)m/)?.[1] ?? 0);
  const seconds: number = Number(textTime.match(/(\d+)s/)?.[1] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}
