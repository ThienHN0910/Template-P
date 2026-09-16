export class VirtualFileSystem {
  private files = new Map<string, string>();

  writeFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  readText(path: string): string {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`File not found in VirtualFileSystem: "${path}"`);
    }
    return content;
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  entries(): [string, string][] {
    return Array.from(this.files.entries());
  }
}
