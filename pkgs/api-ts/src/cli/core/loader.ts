export interface AnythreadsConfig {
  instance: any;
  db: any;
  dbType: "bun_sqlite" | "sqlite3" | "postgres";
}

export async function loadConfig(configPath: string): Promise<AnythreadsConfig> {
  try {
    const module = await import(configPath);

    if (!module.default) {
      throw new Error("Config file must have a default export from setupAnythreads()");
    }

    const config = module.default;

    if (!config || typeof config !== "object") {
      throw new Error("Default export must be an object returned from setupAnythreads()");
    }

    if (config instanceof Error) {
      const errorMessage = config.message || "Unknown error";
      throw new Error(`Config setup failed: ${errorMessage}`);
    }

    const { instance, db, dbType } = config;

    if (!instance) {
      throw new Error("Config must contain an 'instance' property");
    }

    if (!db) {
      throw new Error("Config must contain a 'db' property");
    }

    if (!dbType) {
      throw new Error("Config must contain a 'dbType' property");
    }

    return {
      instance,
      db,
      dbType,
    };
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error}`);
  }
}
