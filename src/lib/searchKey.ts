let lastSearchedUrlKey = '';

export function getLastSearchedUrlKey(): string {
  return lastSearchedUrlKey;
}

export function setLastSearchedUrlKey(key: string): void {
  lastSearchedUrlKey = key;
}

export function resetLastSearchedUrlKey(): void {
  lastSearchedUrlKey = '';
}
