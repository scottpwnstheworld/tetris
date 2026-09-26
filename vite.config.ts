import { defineConfig } from "vite"

const port = Number(process.env.PORT || 8795)
const publicHost = process.env.DEV_PUBLIC_HOST?.trim()

function allowedHosts(): true | string[] {
  if (process.env.DEV_ALLOW_ALL_HOSTS === "1") return true
  const hosts = new Set<string>(["localhost", "127.0.0.1", "themainframe"])
  if (publicHost) hosts.add(publicHost)
  for (const part of (process.env.DEV_ALLOWED_HOSTS ?? "").split(",")) {
    const h = part.trim()
    if (h) hosts.add(h)
  }
  hosts.add(".ts.net")
  hosts.add(".tailscale.net")
  return [...hosts]
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts: allowedHosts(),
  },
})
