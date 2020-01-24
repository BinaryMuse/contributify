import fs from 'fs'
import toml from 'toml'
import moment from 'moment'
import path from 'path'
import { ConfigData } from './src/config'
import Repo from './src/repo'

export async function go () {
  // const targetDir = process.argv[2]
  // await contributify(targetDir)
  // console.log('\nDone')
}

async function contributify (targetDir: string) {
  const tomlData = fs.readFileSync('./config.toml', 'utf8')
  const tomlConfig = toml.parse(tomlData) as ConfigData

  console.log(`Creating repository in '${targetDir}' ...`)
  const repo = await Repo.create(targetDir, tomlConfig)

  let current = moment('20180101', 'YYYYMMDD')
  const end = moment('20201231', 'YYYYMMDD')

  while (current.isSameOrBefore(end)) {
    await repo.writeCommits(current)
    current = current.add(1, 'day')
  }
}
