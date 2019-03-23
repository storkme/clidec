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

Given the following file `test.ts`:

```typescript
import { bootstrap, Command, Help, Opt } from "clidec";

@Help([
  {
    header: "Test - test command",
    content:
      "This command shows how clidec works, and how it can be used to bootstrap cli app development really quickly & with minimal boilerplate." +
      "FYI, this help block uses {green.bold chalk} template syntax."
  },
  {
    header: "Examples",
    content: ["$ test foo [file]", "$ test bar"]
  }
])
class Test {
  @Command({
    name: "foo",
    alias: "f",
    summary: "this foo command does foo stuff",
    help: [
      {
        header: "foo command",
        content:
          "This command uses a bunch of different options, including required options."
      },
      {
        header: "examples",
        content: ["$ cmd foo <file>", "$ cmd foo -r <file>"]
      }
    ]
  })
  public foo(
    @Opt({
      name: "file",
      alias: "f",
      defaultOption: true,
      required: true,
      typeLabel: "file",
      description: "file to read"
    })
    file?: string,
    @Opt({
      name: "raw",
      alias: "r",
      type: Boolean,
      description: "use raw input, for example"
    })
    raw?: boolean
  ): void {
    // do some command stuff
  }

  @Command({
    name: "bar",
    alias: "b",
    summary: "the bar command does bar things",
    help: [
      {
        header: "bar command",
        content:
          "This command has an option that can be used multiple times. The value that's passed to the function will be a string array."
      },
      {
        header: "examples:",
        content: ["$ test bar -m first -m second"]
      }
    ]
  })
  public bar(
    @Opt({
      multiple: true,
      name: "multiple",
      alias: "m",
      description: "argument that can be used multiple times",
      typeLabel: "string"
    })
    multiple: string[]
  ) {
    // do some stuff here
  }
}

// actually run our commands!
bootstrap(new Test());
```

Example output from running `$ ts-node test.ts` / `$ ts-node test.ts help` / `$ ts-node test.ts --help`:

```
Test - test command

  This command shows how clidec works, and how it can be used to bootstrap cli
  app development really quickly & with minimal boilerplate.FYI, this help
  block uses chalk template syntax.

Examples

  $ test foo [file]
  $ test bar

Commands:

  foo   f   this foo command does foo stuff
  bar   b   the bar command does bar things

```

Example output from: `$ ts-node foo.ts help foo`:

```
foo command

  This command uses a bunch of different options, including required options.

examples

  $ cmd foo <file>
  $ cmd foo -r <file>

Options

  -r, --raw         use raw input, for example
  -f, --file file   file to read

```

Example output from: `$ ts-node foo.ts help bar`:

```
bar command

  This command has an option that can be used multiple times. The value that's
  passed to the function will be a string array.

examples

  $ test bar -m first -m second

Options

  -m, --multiple string   argument that can be used multiple times

```

## Still here?

Here is all you need to know to use this thing.

### `@Command(object)` (methods)

Make this function a command.

| property    | type                                                                                                        | description                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| name        | **string (required)**                                                                                       | the name of your (sub) command.                               |
| alias       | _string_                                                                                                    | alias for this command.                                       |
| description | _string_                                                                                                    | used to describe this sub command in the `help` menu.         |
| help        | [_HelpSection_](https://github.com/75lb/command-line-usage#exp_module_command-line-usage--commandLineUsage) | used when your cmd is run with `$ cmd help <subcommand-name>` |

### `@Opt(object)` (parameters)

| property    | type                  | description                                                                                                                                         |
| ----------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | **string (required)** | the name of your param. Should probably match the parameters name                                                                                   |
| alias       | _string_              | alias for this option.                                                                                                                              |
| required    | _boolean_             | whether or not this option is required. If it is required and not provided when the command is executed, the program will print a warning and exit. |
| description | _string_              | used to describe this param in the help menu.                                                                                                       |

**Also includes** all of the properties specified by [command-line-args `OptionDefinition`](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) and those specified by [command-line-usage `OptionDefinition`](https://github.com/75lb/command-line-usage#commandlineusageoptionlist).

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

- Add some tests. This is a rush job.
- Add some kind of 'devMode' option for the bootstrap function which runs a bunch of sanity checks to make sure all the decorators are set up right.
- Add a 'middleware' system so you could handle different output types.
- Add a nice error handler. Maybe support for async functions too.
