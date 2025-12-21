import type { AnythreadsConfig } from "./loader.ts";

export type CommandHandler = (config: AnythreadsConfig, args: string[]) => Promise<void>;

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

export class CommandExecutor {
  private commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  async execute(commandName: string, config: AnythreadsConfig, args: string[]): Promise<void> {
    const command = this.commands.get(commandName);

    if (!command) {
      throw new Error(`Unknown command: ${commandName}`);
    }

    await command.handler(config, args);
  }

  listCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}
