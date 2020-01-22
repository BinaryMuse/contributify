import fs from 'fs'
import readline from 'readline'
import toml from 'toml'
import deepmerge from 'deepmerge'
import moment, { Moment } from 'moment'
import { Repository, Signature, Oid } from 'nodegit'

function random (min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

interface Range {
  min: number
  max: number
}

interface Settings {
  tzOffset: number
  skipChance: number
  weekendSkipChance: number
  author: { name: string, email: string }
  range: {
    normal: Range
    weekend: Range
  }
}

interface Override {
  start: Moment
  end: Moment
  settings: Settings
}

interface ConfigData {
  settings: Settings
  overrides: Array<Override>
}

class Config {
  data: ConfigData

  constructor (data: ConfigData) {
    this.data = data
  }

  getForDay (day: Moment): Settings {
    const overrides = this.data.overrides.filter(override => {
      const start = moment(override.start, 'YYYYMMDD')
      const end = moment(override.end, 'YYYYMMDD')
      return day.isBetween(start, end, undefined, '[]')
    }).map(override => override.settings)

    return deepmerge.all([this.data.settings].concat(overrides)) as Settings
  }
}

class Repo {
  private config: Config
  private repo: Repository
  private tree: Oid
  private nextParents: Array<Oid>

  static async create (targetDir: string, config: Config): Promise<Repo> {
    if (fs.existsSync(targetDir)) {
      throw new Error(`Fatal: directory '${targetDir}' already exists`)
    }

    const repo = await Repository.init(targetDir, 1)
    const index = await repo.index()
    const tree = await index.writeTree()

    return new this(config, repo, tree)
  }

  private constructor (config: Config, repo: Repository, tree: Oid) {
    this.config = config

    this.repo = repo
    this.tree = tree
    this.nextParents = []
  }

  async writeCommits (day: Moment) {
    const settings = this.config.getForDay(day)
    const { author, tzOffset, range, skipChance, weekendSkipChance } = settings

    let numCommits = random(range.normal.min, range.normal.max)
    let skip = false
    if (day.day() === 0 || day.day() === 6) {
      numCommits = random(range.weekend.min, range.weekend.max)
      skip = Math.random() < weekendSkipChance
    } else {
      skip = Math.random() < skipChance
    }

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    if (skip) {
      process.stdout.write(`Skipping commits for ${day.format('YYYY MM DD')} ...`)
      return
    } else {
      process.stdout.write(`Writing ${numCommits} commits for ${day.format('YYYY MM DD')} ...`)
    }

    for (let i = 0; i < numCommits; i++) {
      const signature = Signature.create(author.name, author.email, day.unix(), tzOffset * 60)
      const commit = await this.repo.createCommit('HEAD', signature, signature, `Commit ${i} for ${day.format('YYYYMMDD')}`, this.tree, this.nextParents)
      this.nextParents = [commit]
    }
  }
}

go()

async function go () {
  const targetDir = process.argv[2]
  await contributify(targetDir)
  console.log('\nDone')
}

async function contributify (targetDir: string) {
  const tomlData = fs.readFileSync('./config.toml', 'utf8')
  const tomlConfig = toml.parse(tomlData) as ConfigData

  console.log(`Creating repository in '${targetDir}' ...`)
  const repo = await Repo.create(targetDir, new Config(tomlConfig))

  let current = moment('20180101', 'YYYYMMDD')
  const end = moment('20201231', 'YYYYMMDD')

  while (current.isSameOrBefore(end)) {
    await repo.writeCommits(current)
    current = current.add(1, 'day')
  }
}

export default Config
