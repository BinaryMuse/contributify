import fs from 'fs'
import path from 'path'
import toml from 'toml'
import { ConfigData } from '../config'
import Repo from '../repo'
import moment from 'moment'
import { Command } from 'clipanion'
import * as yup from 'yup'

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

export default class CreateCommand extends Command {
  static usage = Command.Usage({
    description: 'create a new contributified repo',
    details: `
      This command will create a new repository at \`targetDir\` populated with commits as specified by \`configFile\`
    `,
    examples: [[
      'Create a repository in a directory called my-contrib-repo in your home directory using the configuration from `contrib-config.toml`',
      `contributify create ./contrib-config.toml ~/my-contrib-repo`
    ]]
  })

  @Command.String({required: true})
  public configFile!: string;

  @Command.String({required: true})
  public targetDir!: string;

  @Command.Path('create')
  async execute() {
    const { configFile, targetDir } = CreateCommand.schema.cast(this)
    console.log('>> here we go <<')
    console.log(targetDir)
    console.log(configFile)
  }

  static schema = yup.object().shape({
    configFile: yup.string().required().ensure()
      .transform(function(value: string, origValue) {
        return makeAbsolutePath(value)
      }),
    targetDir: yup.string().required().ensure()
      .transform(function(value: string, origValue) {
        return makeAbsolutePath(value)
      })
  })
}

//       argv = argv as CreateOptions
//       throwIf(isBlank(argv.targetDir), "You must specify an output directory")
//       throwIf(fs.existsSync(argv.targetDir), `Output directory ${argv.targetDir} already exists`)
//       throwIf(isBlank(argv.configFile), "You must specify a configuration file")
//       throwIf(!fs.existsSync(argv.configFile), `Configuration file ${argv.configFile} was not found`)

//       return true
//     })
// }
// exports.handler = async (argv: CreateOptions): Promise<any> => {
//   const tomlData = fs.readFileSync(argv.configFile, 'utf8')
//   const tomlConfig = toml.parse(tomlData) as ConfigData

//   console.log(`Creating repository in '${argv.targetDir}' ...`)
//   const repo = await Repo.create(argv.targetDir, tomlConfig)

//   let current = moment('20180101', 'YYYYMMDD')
//   const end = moment('20201231', 'YYYYMMDD')

//   while (current.isSameOrBefore(end)) {
//     await repo.writeCommits(current)
//     current = current.add(1, 'day')
//   }
// }
