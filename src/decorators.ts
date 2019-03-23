import "reflect-metadata";

import { HelpArgs, ICommandArgs, IOptArgs } from "./models";

export const optionKey = Symbol("Opt");
export const defaultCommandKey = Symbol("defaultCommand");
export const helpSectionsKey = Symbol("helpSections");
export const commandKey = Symbol("Command");

/**
 * Define an annotation Opt
 * @param opts
 * @constructor
 */
export function Opt(opts: IOptArgs) {
  return (o: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingRequiredParameters =
      Reflect.getOwnMetadata(optionKey, o, propertyKey) || [];
    existingRequiredParameters.push([parameterIndex, opts]);
    Reflect.defineMetadata(
      optionKey,
      existingRequiredParameters,
      o,
      propertyKey
    );
  };
}

/**
 * Indicates that this function should be run if either:
 *  1) no command name was provided when running your application
 *  2) or the first argument to your script did not match any commands you have defined
 * @constructor
 */
export function DefaultCommand() {
  return (target: any, propertyKey: string) => {
    // assign the name of this function to the target object using our symbol as a key
    target[defaultCommandKey] = propertyKey;
  };
}

/**
 * Indicates that this function is a command
 * @param opts
 * @constructor
 */
export function Command(opts: ICommandArgs) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // TODO: warn if descriptor.value[commandKey] is already set - help out the user if they screwed up
    descriptor.value[commandKey] = opts;
  };
}

/**
 * Help section for your app
 * @param sections
 * @constructor
 */
export function Help(sections: HelpArgs) {
  return (target: any) => {
    target[helpSectionsKey] = sections;
  };
}
