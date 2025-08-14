import { sleep } from "./sleep.ts";

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
  });

  for (let i = timeInSeconds; i > 0; i--) {
    if (signal.aborted) return;
    await Deno.stdout.write(new TextEncoder().encode(`\rShutdown in: ${i}s`));
    await sleep(1000); // 1 sec
  }

  console.log("\nShuting down…");
  if (!dryRun) {
    await new Deno.Command("cmd", {
      args: ["/c", "shutdown", "/s", "/t", "0"],
    }).output();
  } else {
    console.log("(No shutdown: Just testing!)");
  }
}
