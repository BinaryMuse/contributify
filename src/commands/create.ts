import yargs from 'yargs'
import fs from 'fs'
import path from 'path'
import toml from 'toml'
import { CliOptions } from '../types'
import { ConfigData } from '../config'
import Repo from '../repo'
import moment from 'moment'

interface CreateOptions {
  targetDir: string,
  configFile: string
}

function makeAbsolutePath(origPath: string) {
  return path.resolve(process.cwd(), origPath)
}

function throwIf(condition: boolean, message: string): never | null {
  if (condition) {
    throw new Error(message)
  }

  return null
}

function isBlank(maybeStr: string | null | undefined) {
  if (!maybeStr || !maybeStr.trim()) {
    return true
  }

  return false
}

exports.command = 'create <targetDir> [options]'
exports.describe = 'create a new repo yay'
exports.builder = (yargs: yargs.Argv<any>): yargs.Argv<any> => {
  return yargs
    .positional('targetDir', {
      type: 'string',
      description: 'output directory for the generated repo',
    })
    .option('configFile', {
      type: 'string',
      description: 'configuration file for repo generation',
      alias: 'c',
      demand: true,
    })
    .coerce('targetDir', makeAbsolutePath)
    .coerce('configFile', makeAbsolutePath)
    .check((argv: any) => {
      argv = argv as CreateOptions
      throwIf(isBlank(argv.targetDir), "You must specify an output directory")
      throwIf(fs.existsSync(argv.targetDir), `Output directory ${argv.targetDir} already exists`)
      throwIf(isBlank(argv.configFile), "You must specify a configuration file")
      throwIf(!fs.existsSync(argv.configFile), `Configuration file ${argv.configFile} was not found`)

      return true
    })
}
exports.handler = async (argv: CreateOptions): Promise<any> => {
  const tomlData = fs.readFileSync(argv.configFile, 'utf8')
  const tomlConfig = toml.parse(tomlData) as ConfigData

  console.log(`Creating repository in '${argv.targetDir}' ...`)
  const repo = await Repo.create(argv.targetDir, tomlConfig)

  let current = moment('20180101', 'YYYYMMDD')
  const end = moment('20201231', 'YYYYMMDD')

  while (current.isSameOrBefore(end)) {
    await repo.writeCommits(current)
    current = current.add(1, 'day')
  }
}
