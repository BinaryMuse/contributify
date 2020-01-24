import deepmerge from 'deepmerge'
import moment, { Moment } from 'moment'

export interface Range {
  min: number
  max: number
}

export interface Settings {
  tzOffset: number
  skipChance: number
  weekendSkipChance: number
  author: { name: string, email: string }
  range: {
    normal: Range
    weekend: Range
  }
}

export interface Override {
  start: Moment
  end: Moment
  settings: Settings
}

export interface ConfigData {
  settings: Settings
  overrides: Array<Override>
}

export function getSettingsForDay(cfg: ConfigData, day: Moment): Settings {
  const overrides = cfg.overrides.filter(override => {
    const start = moment(override.start, 'YYYYMMDD')
    const end = moment(override.end, 'YYYYMMDD')
    return day.isBetween(start, end, undefined, '[]')
  }).map(override => override.settings)

  return deepmerge.all([cfg.settings].concat(overrides)) as Settings
}
