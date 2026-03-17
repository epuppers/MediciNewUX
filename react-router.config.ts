import type { Config } from "@react-router/dev/config";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default {
  basename: isGitHubPages ? "/MediciNewUX/" : "/",
  ssr: false,
} satisfies Config;
