import toml from 'toml'
import deepmerge from 'deepmerge'
import { isSameDay, isAfter, isBefore, parse } from 'date-fns'
import * as yup from 'yup'
import type { Asserts, TypeOf } from 'yup'

function transformDate(_val: Date, originalVal: string): Date {
  return parse(originalVal, "yyyyMMdd", new Date())
}

const DATE_SCHEMA = yup.date().transform(transformDate)

const RANGE_SCHEMA = yup.object().shape(({
  min: yup.number().integer().required(),
  max: yup.number().integer().required(),
}))

const SETTINGS_SCHEMA = yup.object().shape({
  start: DATE_SCHEMA.required(),
  end: DATE_SCHEMA.required(),
  tzOffset: yup.number().integer().default(0),
  author: yup.object().shape({
    name: yup.string().required().ensure(),
    email: yup.string().email().required().ensure(),
  }).required(),
  skipChance: yup.number().min(0).max(1).required(),
  weekendSkipChance: yup.number().min(0).max(1), // default to regular skip chance
  range: yup.object().shape({
    normal: RANGE_SCHEMA.required(),
    weekend: RANGE_SCHEMA.default(undefined),
  }).required()
})

const OVERRIDE_SETTINGS_SCHEMA = yup.object().shape({
  skipChance: yup.number().min(0).max(1).default(undefined),
  weekendSkipChance: yup.number().min(0).max(1).default(undefined),
  range: yup.object().shape({
    normal: RANGE_SCHEMA,
    weekend: RANGE_SCHEMA,
  }).default(undefined)
})

const OVERRIDE_SCHEMA = yup.object().shape({
  start: DATE_SCHEMA.required(),
  end: DATE_SCHEMA.required(),
  settings: OVERRIDE_SETTINGS_SCHEMA.required()
}).required()

const SCHEMA = yup.object().shape({
  settings: SETTINGS_SCHEMA.required(),
  overrides: yup.array().of(OVERRIDE_SCHEMA).default([]),
})

export interface ConfigData extends TypeOf<typeof SCHEMA> { }
export interface Settings extends TypeOf<typeof SETTINGS_SCHEMA> { }
export interface Override extends Asserts<typeof OVERRIDE_SCHEMA> { }

export function parseToml(data: string): ConfigData {
  const tomlConfig = toml.parse(data)
  const validated: ConfigData = SCHEMA.validateSync(tomlConfig);
  return validated
}

export function getSettingsForDay(cfg: ConfigData, day: Date): Settings {
  const overrides = cfg.overrides.filter((override: Override) => {
    const start = override.start
    const end = override.end
    return (isSameDay(start, day) || isBefore(start, day)) && (isSameDay(start, end) || isAfter(end, day))
  }).map((override: Override) => override.settings)

  return deepmerge.all([cfg.settings].concat(overrides)) as Settings
}
