# Contributify

Create a repository populated with empty commits based on a configuration file. Useful for populating a GitHub contribution graph.

## Usage

Contributify generates commits based on a [TOML](https://github.com/toml-lang/toml) configuration file. See [Configuration](#configuration) for more details.

```bash
# Create a new repo based on the configuration in 'settings.toml'.
# The repository will be created at `~/my-new-repo`
npx contributify create settings.toml ~/my-new-repo
```

## Configuration

Contributify is configured via a configuration file written in [TOML](https://github.com/toml-lang/toml).

```toml
[settings]
# The `start` and `end` values control which days commits are generated for.
# All dates are in `YYYYMMDD` format.
start = "20210101"
end = "20211231"

# Set `tzOffset` to your timezone offset
tzOffset = -7

# `skipChance` and `weekendSkipChance` are values from 0 to 1
# that specify how likely it is that a day has no commits whatsoever.
# A value of `0` will never skip a day, and `1` will always skip every day.
skipChance = 0.1
weekendSkipChance = 0.6

# The `author` settings control the name and email used to generate commits.
[settings.author]
name = "Your Name"
email = "your@email.com"

# Ranges control how many commits are generated for each day,
# based on a minimum and maximum.
[settings.range.normal]
min = 1
max = 50

# You may specify separate values for weekends, but this is
# optional if you want to use the same values as for weekdays.
[settings.range.weekend]
min = 1
max = 10

# You may optionally specify any number of overrides, which specify
# different settings for specific date ranges. Useful for generating
# less commits over vacations and holidays.
[[overrides]]
  start = "20211218"
  end = "20211231"

  [overrides.settings]
  skipChance = 0.9
  weekendSkipChance = 0.95

  [overrides.settings.range.normal]
  min = 1
  max = 3

  [overrides.settings.range.weekend]
  min = 1
  max = 3

# This override overlaps with the previous one; in such a case, the
# override listed last takes precedence.
[[overrides]]
  start = "20211225"
  end = "20211225"

  [overrides.settings]
  skipChance = 1
  weekendSkipChance = 1
```

`./bin/contributify create
