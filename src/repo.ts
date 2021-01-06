import { format, getUnixTime } from 'date-fns'
import { Repository, Signature, Oid } from 'nodegit'
import fs from 'fs'
import readline from 'readline'
import { ConfigData, getSettingsForDay } from './config'

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export default class Repo {
  private config: ConfigData
  private repo: Repository
  private tree: Oid
  private nextParents: Array<Oid>

  static async create(targetDir: string, config: ConfigData): Promise<Repo> {
    if (fs.existsSync(targetDir)) {
      throw new Error(`Fatal: directory '${targetDir}' already exists`)
    }

    const repo = await Repository.init(targetDir, 1)
    const index = await repo.index()
    const tree = await index.writeTree()

    return new this(config, repo, tree)
  }

  private constructor(config: ConfigData, repo: Repository, tree: Oid) {
    this.config = config

    this.repo = repo
    this.tree = tree
    this.nextParents = []
  }

  async writeCommits(day: Date) {
    const settings = getSettingsForDay(this.config, day)
    const { author, tzOffset, range, skipChance, weekendSkipChance } = settings

    let numCommits = random(range.normal.min, range.normal.max)
    let skip = false
    if (day.getDay() === 0 || day.getDay() === 6) {
      numCommits = random(range.weekend.min, range.weekend.max)
      let actualWeekendSkipChance = weekendSkipChance !== undefined ? weekendSkipChance : skipChance!
      skip = Math.random() < actualWeekendSkipChance
    } else {
      skip = Math.random() < skipChance!
    }

    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    if (skip) {
      process.stdout.write(`Skipping commits for ${format(day, 'yyyy MM dd')} ...`)
      return
    } else {
      process.stdout.write(`Writing ${numCommits} commits for ${format(day, 'yyyy MM dd')} ...`)
    }

    for (let i = 0; i < numCommits; i++) {
      const signature = Signature.create(author.name, author.email, getUnixTime(day), tzOffset * 60)
      const commit = await this.repo.createCommit('HEAD', signature, signature, `Commit ${i} for ${format(day, 'yyyyMMdd')}`, this.tree, this.nextParents)
      this.nextParents = [commit]
    }
  }
}
