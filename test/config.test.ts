import * as fs from 'fs'
import * as path from 'path'
import { assert } from 'chai'
import { parseToml, getSettingsForDay } from '../src/config'

describe('config', () => {
  const data = fs.readFileSync(path.join(__dirname, '..', 'config.toml'), 'utf8')

  it('parses valid config', () => {
    assert.doesNotThrow(() => parseToml(data))
  })

  it('handles overrides correctly', () => {
    const cfg = parseToml(data)
    assert.equal(cfg.settings.tzOffset, -7);
    assert.equal(cfg.settings.skipChance, 0.1);
    assert.equal(cfg.settings.weekendSkipChance, 0.6);

    let feb1 = getSettingsForDay(cfg, new Date(2021, 1, 1))
    assert.equal(feb1.tzOffset, -7);
    assert.equal(feb1.skipChance, 0.1)
    assert.equal(feb1.weekendSkipChance, 0.6)
    assert.equal(feb1.range.normal.min, 1)
    assert.equal(feb1.range.normal.max, 50)

    let dec24 = getSettingsForDay(cfg, new Date(2021, 11, 24))
    assert.equal(dec24.tzOffset, -7);
    assert.equal(dec24.skipChance, 0.95)
    assert.equal(dec24.weekendSkipChance, 0.99)
    assert.equal(dec24.range.normal.min, 1)
    assert.equal(dec24.range.normal.max, 3)

    // Dec 25 has skip chance set to 1, but inherits min and max from previous
    // override.
    let dec25 = getSettingsForDay(cfg, new Date(2021, 11, 25))
    assert.equal(dec25.tzOffset, -7);
    assert.equal(dec25.skipChance, 1)
    assert.equal(dec25.weekendSkipChance, 1)
    assert.equal(dec25.range.normal.min, 1)
    assert.equal(dec25.range.normal.max, 3)
  })
})

