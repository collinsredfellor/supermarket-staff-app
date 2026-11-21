const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/supermarket-staff-app" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
