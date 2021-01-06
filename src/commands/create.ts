import fs from 'fs'
import path from 'path'
import { Command } from 'clipanion'
import * as yup from 'yup'
import { isSameDay, isBefore, addDays } from 'date-fns'
import { parseToml } from '../config'
import Repo from '../repo'

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
      'Create a repository at ~/my-contrib-repo using the configuration from `contrib-config.toml`',
      `contributify create ./contrib-config.toml ~/my-contrib-repo`
    ]]
  })

  @Command.String({ required: true })
  public configFile!: string;

  @Command.String({ required: true })
  public targetDir!: string;

  @Command.Path('create')
  async execute() {
    const { configFile, targetDir } = CreateCommand.schema.cast(this)

    throwIf(isBlank(targetDir), "You must specify an output directory")
    throwIf(fs.existsSync(targetDir), `Output directory ${targetDir} already exists`)
    throwIf(isBlank(configFile), "You must specify a configuration file")
    throwIf(!fs.existsSync(configFile), `Configuration file ${configFile} was not found`)

    const configText = fs.readFileSync(configFile, 'utf8')
    const config = parseToml(configText)
    const repo = await Repo.create(targetDir, config)

    let current = config.settings.start
    const end = config.settings.end

    while (isSameDay(current, end) || isBefore(current, end)) {
      await repo.writeCommits(current)
      current = addDays(current, 1)
    }
  }

  static schema = yup.object().shape({
    configFile: yup.string().required().ensure()
      .transform(function (value: string) {
        return makeAbsolutePath(value)
      }),
    targetDir: yup.string().required().ensure()
      .transform(function (value: string) {
        return makeAbsolutePath(value)
      })
  })
}
