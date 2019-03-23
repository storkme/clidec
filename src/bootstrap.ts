import "reflect-metadata";

import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";
import { commandKey, helpSectionsKey, optionKey } from "./decorators";
import { ICommandArgs } from "./models";

function buildCommandFnArgs(meta, mergeOptions: any) {
  // build args to pass to the function when we call it based on @Opt params
  return Array.from({ length: meta.length }).map((_, i) => {
    const matchingMeta = meta.find(([index]) => index === i);

    // TODO: sanity check if matchingMeta.name doesn't exist...
    return matchingMeta ? mergeOptions[matchingMeta[1].name] : undefined;
  });
}

function getSchemaCmds(schema: object): { [k: string]: ICommandArgs } {
  // get all methods defined in our schema
  const methods = Object.getOwnPropertyDescriptors(
    schema.constructor.prototype
  );
  // loop through methods, checking which ones have a @Command annotation
  return Object.keys(methods)
    .filter(k => methods[k].value[commandKey])
    .reduce((acc, k) => {
      acc[k] = methods[k].value[commandKey];
      return acc;
    }, {});
}

function printSubCmdHelp(schema: object, functionName: string): void {
  // now we need to get the option list for this function ..........
  const optionList = Reflect.getMetadata(optionKey, schema, functionName).map(
    ([, optionDefiniton]) => optionDefiniton
  );

  console.log(
    commandLineUsage([
      ...schema[functionName][commandKey].help,
      {
        header: "Options",
        optionList
      }
    ])
  );
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
      printSubCmdHelp(schema, helpSubCmd);
    } else {
      // loop through methods, checking which ones have a @Command annotation
      const commandOpts = Object.values(getSchemaCmds(schema)).map(
        ({ name, summary, alias }) => ({
          name,
          alias,
          summary
        })
      );

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
  // find the cmd with the provided command name, or the default command, or do an error
  const cmds = getSchemaCmds(schema);
  const [matchingCmd] = Object.keys(cmds)
    .filter(k => cmds[k].name === command || cmds[k].alias === command)
    .map(k => [k, cmds[k]] as [string, ICommandArgs]);

  // get decorator metadata from function with provided name
  if (matchingCmd) {
    const [methodName] = matchingCmd;
    const meta = Reflect.getMetadata(optionKey, schema, methodName);

    // extract just the merge options from param definitions
    const mergeDefs = meta.map(([index, opts]) => opts);

    // command is either the named command or the default command
    const cmd = schema[methodName].bind(schema);

    // parse our actual command line arguments, with the above merge defs
    const mergeOptions = commandLineArgs(mergeDefs, { argv });

    const requiredParams = meta.filter(
      ([, { required, name }]) => required && !mergeOptions[name]
    );

    if (requiredParams.length > 0) {
      printSubCmdHelp(schema, methodName);
      console.log();
      console.error(
        "Missing required arguments: " +
          requiredParams.map(([, { name }]) => name).join(", ")
      );
      console.log("(see above ☝️ for help)");
      process.exit(1);
    }

    // actually run our sub command
    cmd(...buildCommandFnArgs(meta, mergeOptions));
  } else {
    console.error(
      command ? "no command found for: " + command : "no default command found"
    );
    process.exit(1);
  }
}
