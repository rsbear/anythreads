import { describe, test, expect } from "bun:test";
import { loadConfig } from "../core/loader.ts";
import { join, dirname } from "path";

describe("Config Loader", () => {
  test("should load valid config file", async () => {
    const testDir = dirname(import.meta.url).replace("file://", "");
    const configPath = join(testDir, "anythreads.cli.ts");
    
    const config = await loadConfig(configPath);
    
    expect(config).toBeTruthy();
    expect(config.instance).toBeTruthy();
  });
  
  test("should throw error for missing config", async () => {
    const invalidPath = "/tmp/nonexistent.ts";
    
    await expect(loadConfig(invalidPath)).rejects.toThrow();
  });
});
