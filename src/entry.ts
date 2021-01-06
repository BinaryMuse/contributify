import { Cli, Command, BaseContext } from 'clipanion'
import CreateCommand from './commands/create'

class HelpCommand extends Command {
  @Command.Path()
  @Command.Path('--help')
  @Command.Path('-h')
  async execute() {
    this.context.stdout.write(this.cli.usage(null))
  }
}

export async function start(processArgv: ReadonlyArray<any>) {
  const cli = new Cli({
    binaryLabel: 'Contributify',
    binaryName: 'contributify',
    binaryVersion: require('../package.json').version
  })

  cli.register(HelpCommand)
  cli.register(CreateCommand)

  await cli.runExit(processArgv.slice(2), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  })
}

// export function start(processArgv: ReadonlyArray<any>) {
//   const args = getArgsParser().parse(processArgv.slice(2)) as CliOptions
//   // console.log(JSON.stringify(args, null, '  '))
// }

// export function getArgsParser(): yargs.Argv<any> {
//   return yargs
//     .usage('$0 <command> [options]')
//     .commandDir('commands', {
//       extensions: ['ts']
//     })
//     .recommendCommands()
//     // .demandCommand(1, 1, 'Please pass a command')
//     // .command(['create <output>', '* <output>'], 'create a repo', (yargs) => {
//     // .command('create <output>', 'create a repo', (yargs) => {
//     //   return yargs
//     //     .positional('output', {
//     //       description: 'path to write the created repo to',
//     //       type: 'string',

//     //     })
//     // }, (argv) => {
//     // })
//     // .command('preview <repo>', 'Generate a preview of a Graph for a repo', (yargs) => {
//     //   return yargs
//     //     .positional('repo', {
//     //       describe: 'path to the repo to visuialize',
//     //       type: 'string'
//     //     })
//     // })
//     // .option('targetDir', {
//     //   alias: 't',
//     //   description: 'target directory',
//     // })
//     .help()
// }
