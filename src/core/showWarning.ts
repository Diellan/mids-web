type WarningListener = (message: string) => void;
type ConfirmListener = (message: string, resolve: (confirmed: boolean) => void) => void;

let warningListener: WarningListener | null = null;
let confirmListener: ConfirmListener | null = null;

export function onWarning(fn: WarningListener): void {
  warningListener = fn;
}

export function offWarning(): void {
  warningListener = null;
}

export function showWarning(message: string): void {
  console.warn(message);
  warningListener?.(message);
}

export function onConfirm(fn: ConfirmListener): void {
  confirmListener = fn;
}

export function offConfirm(): void {
  confirmListener = null;
}

export function showConfirm(message: string): Promise<boolean> {
  console.warn(message);
  if (!confirmListener) {
    return Promise.resolve(true);
  }
  return new Promise<boolean>((resolve) => {
    confirmListener!(message, resolve);
  });
}
