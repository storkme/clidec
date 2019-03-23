import "reflect-metadata";

import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";
import {
  commandKey,
  defaultCommandKey,
  helpSectionsKey,
  optionKey
} from "./decorators";

function buildCommandFnArgs(meta, mergeOptions: any) {
  // build args to pass to the function when we call it based on @Opt params
  return Array.from({ length: meta.length }).map((_, i) => {
    const matchingMeta = meta.find(([index]) => index === i);

    // TODO: sanity check if matchingMeta.name doesn't exist...
    return matchingMeta ? mergeOptions[matchingMeta[1].name] : undefined;
  });
}

/**
 * Run the provided application
 * @param schema
 */
export function bootstrap<T extends object>(schema: T) {
  // parse main cmd
  const { command, _unknown, help } = commandLineArgs(
    [
      { name: "command", defaultOption: true },
      { name: "help", alias: "h", type: Boolean }
    ],
    { stopAtFirstUnknown: true }
  );

  // check for help menu stuff
  const helpCmdSpecified = command && command.toLowerCase() === "help";
  const helpSubCmd = _unknown && _unknown[0];
  const helpFlagUsed = !!help;

  // handle any help options specified
  if (!command || helpCmdSpecified || helpFlagUsed) {
    // if the user did `help <command>`, that @Command exists, and it has a `help` section
    if (
      helpCmdSpecified &&
      helpSubCmd &&
      schema[helpSubCmd] &&
      schema[helpSubCmd][commandKey] &&
      schema[helpSubCmd][commandKey].help
    ) {
      // now we need to get the option list for this function ..........
      const optionList = Reflect.getMetadata(optionKey, schema, helpSubCmd).map(
        ([, optionDefiniton]) => optionDefiniton
      );

      console.log(
        commandLineUsage([
          ...schema[helpSubCmd][commandKey].help,
          {
            header: "Options",
            optionList
          }
        ])
      );
    } else {
      // get all methods defined in our schema
      const methods = Object.getOwnPropertyDescriptors(
        schema.constructor.prototype
      );
      // loop through methods, checking which ones have a @Command annotation
      const commandOpts = Object.keys(methods)
        .map(k => methods[k].value[commandKey])
        .filter(i => i)
        .map(({ name, summary,alias }) => ({
          name,
          alias,
          summary
        }));

      console.log(
        commandLineUsage([
          ...schema.constructor[helpSectionsKey],
          {
            header: "Commands:",
            content: commandOpts
          }
        ])
      );
    }

    process.exit(1);
  }

  // get extra args
  const argv = _unknown || [];

  // get decorator metadata from function with provided name
  let meta;
  if (schema[command]) {
    meta = Reflect.getMetadata(optionKey, schema, command);
  } else if (schema[defaultCommandKey]) {
    meta = Reflect.getMetadata(optionKey, schema, schema[defaultCommandKey]);
  } else {
    console.error(
      command ? "no command found for: " + command : "no default command found"
    );
    process.exit(1);
  }

  // extract just the merge options from param definitions
  const mergeDefs = meta.map(([index, opts]) => opts);

  // command is either the named command or the default command
  const cmd = schema[command] || schema[schema[defaultCommandKey]];

  // parse our actual command line arguments, with the above merge defs
  const mergeOptions = commandLineArgs(mergeDefs, { argv });

  // actually run our sub command
  cmd(...buildCommandFnArgs(meta, mergeOptions));
}
