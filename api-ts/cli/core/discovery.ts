import { existsSync } from "fs";
import { join, dirname } from "path";

const CONFIG_FILENAME = "anythreads.cli.ts";

export async function discoverConfig(startPath?: string): Promise<string | null> {
  let currentPath = startPath || process.cwd();
  
  while (true) {
    const configPath = join(currentPath, CONFIG_FILENAME);
    
    if (existsSync(configPath)) {
      return configPath;
    }
    
    const parentPath = dirname(currentPath);
    
    if (parentPath === currentPath) {
      return null;
    }
    
    currentPath = parentPath;
  }
}
