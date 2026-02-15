/**
 * Given an asset path like ./assets/Enhancements/X.png, returns the
 * database-specific fallback path ./Databases/{dbName}/Images/Enhancements/X.png.
 * Returns null if the path doesn't start with ./assets/.
 */
export function getAssetFallbackPath(src: string, databaseName: string): string | null {
  if (!src.startsWith('./assets/')) return null;
  return src.replace('./assets/', `./Databases/${databaseName}/Images/`);
}
