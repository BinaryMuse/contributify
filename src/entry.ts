import { Cli, Command } from 'clipanion'
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
  // cli.register(PreviewCommand)

  await cli.runExit(processArgv.slice(2), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  })
}
