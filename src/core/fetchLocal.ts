/**
 * Drop-in replacement for fetch() that reads local files via Electron IPC (fs).
 * Returns a standard Response object so .arrayBuffer(), .text(), .json() work unchanged.
 * Falls back to native fetch() in non-Electron environments (e.g., tests).
 */
export async function fetchLocal(url: string): Promise<Response> {
  const ipc = typeof window !== 'undefined' ? (window as any).ipcRenderer : undefined;
  if (ipc) {
    try {
      const data = await ipc.invoke('fs:read-file', url);
      if (data === null) {
        return new Response(null, { status: 404, statusText: 'Not Found' });
      }
      // IPC transfers Node.js Buffer as Uint8Array to renderer
      const arrayBuffer = (data as Uint8Array).buffer.slice(
        (data as Uint8Array).byteOffset,
        (data as Uint8Array).byteOffset + (data as Uint8Array).byteLength
      ) as ArrayBuffer;
      return new Response(arrayBuffer);
    } catch {
      return new Response(null, { status: 500, statusText: 'Read Error' });
    }
  }
  return fetch(url);
}
