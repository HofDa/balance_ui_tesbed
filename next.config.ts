import type { NextConfig } from 'next';

const repoName = 'balance_ui_tesbed';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isGitHubPagesBuild ? `/${repoName}` : '',
  assetPrefix: isGitHubPagesBuild ? `/${repoName}/` : undefined,
};

export default nextConfig;
