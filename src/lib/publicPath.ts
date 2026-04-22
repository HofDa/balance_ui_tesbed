const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === '/') {
    return '';
  }

  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
}

export function publicPath(path: `/${string}`): string {
  return `${normalizeBasePath(configuredBasePath)}${path}`;
}
