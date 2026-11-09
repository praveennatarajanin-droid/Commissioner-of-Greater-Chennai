import { spawn } from "child_process";

const PORT = "3005";
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;

async function main() {
  console.log(`Starting Next.js server on ${BASE_URL}...`);
  const server = spawn("npx", ["next", "start", "-H", HOST, "-p", PORT], {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  server.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Ready in") || s.includes("started server on")) {
      console.log("[Server]", s.trim());
    }
  });

  server.stderr.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Error") || s.includes("error")) {
      console.error("[Server Error]", s.trim());
    }
  });

  // Wait for server to become ready
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`${BASE_URL}/api/admin/csrf`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    console.error("Server failed to become ready in 20 seconds.");
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", server.pid.toString(), "/f", "/t"]);
    } else {
      server.kill();
    }
    process.exit(1);
  }

  console.log("Server is ready! Running 16-point Restoration Alert Suite...");

  const testProcess = spawn("node", ["scripts/test_restoration_alert_suite.mjs"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      TEST_BASE_URL: BASE_URL,
    },
  });

  testProcess.on("close", (code) => {
    console.log(`Test suite finished with code ${code}. Cleaning up server...`);
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", server.pid.toString(), "/f", "/t"]);
    } else {
      server.kill();
    }
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("Runner error:", err);
  process.exit(1);
});

