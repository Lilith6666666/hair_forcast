# hair_forcast

Standalone AI Dungeon script set for comedic hair-day status effects.

Open source - authored by Lilith6666666.

## What it does

- Tracks daily hair conditions and metrics.
- Generates a forecast label: `GOOD`, `CHAOTIC NEUTRAL`, or `BAD`.
- Adds a compact context cue at day start or periodic turns.
- Creates and updates story cards automatically.

## Files

- `library.js`
- `input.js`
- `context.js`
- `output.js`

## Story cards

### 1) Hair Forecast Config
Auto-created if missing.

Default `entry` values:

```txt
hair_type = wavy
hair_length = medium
humidity_sensitivity = 3
oiliness = 3
frizz_prone = 3
snark_level = 3
turns_per_day = 25
```

Value ranges:
- `hair_type`: `straight|wavy|curly|coily`
- `hair_length`: `short|medium|long`
- `humidity_sensitivity`, `oiliness`, `frizz_prone`, `snark_level`: `1-5`
- `turns_per_day`: `1-200`

### 2) Hair Forecast Status
Updated every turn. Includes:
- Day number
- Forecast label
- Conditions: humidity, wind, sleep
- Metrics: frizz/oil/volume/static/definition
- Suggested move + snark aside

## Commands

- `/hair help`
- `/hair status`
- `/hair set type <straight|wavy|curly|coily>`
- `/hair set length <short|medium|long>`
- `/hair set frizz <1-5>`
- `/hair set oil <1-5>`
- `/hair set humidity <1-5>`
- `/hair set snark <1-5>`
- `/hair wash`
- `/hair style <natural|bun|pony|braid|straighten|curl>`
- `/hair nextday [N]`

## Behavior notes

- Day progression uses `turns_per_day` (after N turns, day increments).
- Daily conditions are stable within a day via seeded-ish per-day RNG.
- Context injection is compact and physical-status focused, not personality rewrite.

## Install in AI Dungeon

1. Open scenario -> Advanced -> Scripting.
2. Paste:
   - `library.js` into Library
   - `input.js` into Input
   - `context.js` into Context
   - `output.js` into Output
3. Save.

