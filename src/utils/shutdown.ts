import { showTimer } from "./show-timer.ts";

export async function shutodwn(
  timeInSeconds: number,
  dryRun: boolean = false,
): Promise<void> {
  console.log("Press CTRL+C to cancel.");

  const controller: AbortController = new AbortController();
  const signal: AbortSignal = controller.signal;

  Deno.addSignalListener("SIGINT", () => {
    controller.abort();
    console.log("\nShutdown canceled!");
    Deno.exit(1);
  });

  await showTimer(timeInSeconds, signal);

  console.log("\nShuting down…");
  if (!dryRun) {
    await new Deno.Command("cmd", {
      args: ["/c", "shutdown", "/s", "/t", "0"],
    }).output();
  } else {
    console.log("(No shutdown: Just testing!)");
  }
}
