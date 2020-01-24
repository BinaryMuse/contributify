import yargs from 'yargs'
import { CliOptions } from './types'

export function start(processArgv: ReadonlyArray<any>) {
  const args = getArgsParser().parse(processArgv.slice(2)) as CliOptions
  // console.log(JSON.stringify(args, null, '  '))
}

export function getArgsParser(): yargs.Argv<any> {
  return yargs
    .usage('$0 <command> [options]')
    .commandDir('commands', {
      extensions: ['ts']
    })
    .recommendCommands()
    // .demandCommand(1, 1, 'Please pass a command')
    // .command(['create <output>', '* <output>'], 'create a repo', (yargs) => {
    // .command('create <output>', 'create a repo', (yargs) => {
    //   return yargs
    //     .positional('output', {
    //       description: 'path to write the created repo to',
    //       type: 'string',

    //     })
    // }, (argv) => {
    // })
    // .command('preview <repo>', 'Generate a preview of a Graph for a repo', (yargs) => {
    //   return yargs
    //     .positional('repo', {
    //       describe: 'path to the repo to visuialize',
    //       type: 'string'
    //     })
    // })
    // .option('targetDir', {
    //   alias: 't',
    //   description: 'target directory',
    // })
    .help()
}
