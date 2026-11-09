export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Intercept client connection aborts (ECONNRESET) so they never bubble as uncaught exceptions
    process.on("uncaughtException", (err: any) => {
      if (
        err?.code === "ECONNRESET" ||
        err?.message === "aborted" ||
        err?.name === "AbortError" ||
        (typeof err?.message === "string" && err.message.toLowerCase().includes("aborted"))
      ) {
        // Normal client browser socket disconnect / navigation cancellation
        return;
      }
      console.error("[Server UncaughtException]", err);
    });

    process.on("unhandledRejection", (reason: any) => {
      if (
        reason?.code === "ECONNRESET" ||
        reason?.message === "aborted" ||
        reason?.name === "AbortError" ||
        (typeof reason?.message === "string" && reason.message.toLowerCase().includes("aborted"))
      ) {
        return;
      }
      console.error("[Server UnhandledRejection]", reason);
    });
  }
}
