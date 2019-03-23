import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";

export interface ICommandArgs {
  name: string;
  alias?: string;
  summary?: string;
  help?: HelpArgs;
}

export interface IOptArgs extends commandLineArgs.OptionDefinition {
  description?: string;
}

export type HelpArgs = commandLineUsage.Section | commandLineUsage.Section[];
