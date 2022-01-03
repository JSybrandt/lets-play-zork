export interface HistItem {
  command?: string;
  prompt?: string;
  error?: string;


}

export function histItemsEqual(a: HistItem, b:HistItem): boolean {
    return a.command === b.command && a.prompt === b.prompt && a.error === b.error;
  }

