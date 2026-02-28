import app from "./src/app";

const DEFAULT_PORT = 3000;

async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    try {
      const server = Bun.serve({
        port,
        fetch: (req) => new Response("OK"),
      });
      server.stop();
      return port;
    } catch {
      // Port is in use, try next one
    }
  }
  throw new Error(`Could not find available port in range ${startPort}-${startPort + 99}`);
}

const port = await findAvailablePort(DEFAULT_PORT);
console.log(`🚀 Server starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
