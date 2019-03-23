# clidec

this software is very much a WIP.

## What?

A tiny **framework** for building **CLI tools/application** using **decorators** and **TypeScript**.

Built on [command-line-args](https://www.npmjs.com/package/command-line-args) and [command-line-usage](https://www.npmjs.com/package/command-line-usage).

Inspired by [NestJS](https://nestjs.com/) and [Angular](https://angular.io/).

## Why?

- You like writing CLI tools, but you hate the tedious overhead of having to set up sub-commands & options/flags, plus supporting decent help menus.
- You think CLI tools like [Helm](https://helm.sh/) and [git](https://git-scm.com/) are pretty good examples of how CLI tools should work.
- Meta-programming is cool in 2019
- If you call yourself a JS dev and you're not writng frameworks what are you doing with your life?

## Ok, show me?

Given the following file `foo.ts` or whatever:

```typescript
// required I think
import "reflect-metadata";

import { bootstrap, Command, Help, Opt } from "clidec";

@Help([
  {
    header: "Cool cmd",
    content:
      "This command does some rly cool stuff, you can use it for interesting whatever " +
      "things blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah"
  },
  {
    header: "Examples",
    content: ["$ cmd test [user]", "$ cmd whatever"]
  }
])
class foo {
  @Command({
    name: "test",
    alias: "t",
    description: "This test command is good and does stuff",
    help: [
      {
        header: "A test command",
        content: "this does some test stuff"
      }
    ]
  })
  public test(
    @Opt({
      name: "user",
      alias: "u",
      defaultOption: true,
      description: "[string] filter by username or whatever"
    })
    user?: string,
    @Opt({
      name: "type",
      alias: "t",
      multiple: true,
      description: "[string] filter by command type"
    })
    type?: string[],
    @Opt({
      name: "includeRaw",
      alias: "r",
      type: Boolean,
      description: "include the raw log output"
    })
    includeRaw?: boolean
  ): void {
    // do some command stuff
  }

  @Command({
    name: "whatever",
    alias: "w",
    description: "another command for whatever",
    help: [
      {
        header: "Whatever command",
        content: "this command does whatever, i don't even know, leave me alone"
      },
      {}
    ]
  })
  public whatever(
    @Opt({
      name: "dontCare",
      alias: "d",
      type: Boolean,
      description: "don't care?"
    })
    opt?: boolean
  ) {
    // do some command stuff here
  }
}

// the bootstrap function does all of the work of
// handling process.argv and calling our decorated
// functions with the appropriate params!
bootstrap(new foo());
```

Example output from running `$ ts-node foo.ts help`:

```
Cool cmd

This command does some rly cool stuff, you can use it for interesting
whatever things blah blah blah blah blah blah blah blah blah blah blah blah
blah blah blah blah blah

Examples

$ cmd test [user]
$ cmd whatever

Command List

test       t   This test command is good and does stuff
whatever   w   another command for whatever
```

Example output from: `$ ts-node foo.ts help test`:

```
A test command

this does some test stuff

Options

-r, --includeRaw    include the raw log output
-t, --type          [string] filter by command type
-u, --user          [string] filter by username or whatever

```

Example output from: `$ ts-node foo.ts help whatever`:

```
Whatever command

this command does whatever, i don't even know, leave me alone


Options

-d, --dontCare    don't care?

```

## Still here?

Here is all you need to know to use this thing.

### `@Command(object)` (methods)

Make this function a command.

| property    | type / description                                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | **string (required)** the name of your (sub) command.                                                                                                                       |
| alias       | _string_: alias for this command.                                                                                                                                           |
| description | _string_ used to describe this sub command in the `help` menu.                                                                                                              |
| help        | [**HelpSection**](https://github.com/75lb/command-line-usage#exp_module_command-line-usage--commandLineUsage) used when your cmd is run with `$ cmd help <subcommand-name>` |

### `@Opt(object)` (parameters)

Make this parameter an option like a flag or argument. Includes all of the properties [specified by command-line-args](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) and those [specified by command-line-usage](https://github.com/75lb/command-line-usage#commandlineusageoptionlist)

### `@Help(HelpArgs)` (classes)

Create a help menu using [command-line-usage](https://www.npmjs.com/package/command-line-usage) which will show up when the user runs `$ help` or `$ --help`.

### `bootstrap(object)`

Once you've created your class and decorated it with the above ☝️ decorators, you will probably want to run it. Luckily, this is pretty easy. Just import the `bootstrap` function from `clidec` and pass an instance of your class to it.

### **Important**

Remember you **NEED TO** add this the `compilerOptions` section of your `tsconfig.json`:

```
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
```

## Future:

* Add some tests. This is a rush job.
* Add some kind of 'devMode' option for the bootstrap function which runs a bunch of sanity checks to make sure all the decorators are set up right.
* Add a 'middleware' system so you could handle different output types.
* Add a nice error handler. Maybe support for async functions too.
