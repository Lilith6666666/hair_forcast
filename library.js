// Open source — authored by Lilith6666666

if (!globalThis.HairForecast) {
  globalThis.HairForecast = (() => {
    const VERSION = "1.0.0";
    const CONFIG_TITLE = "Hair Forecast Config";
    const STATUS_TITLE = "Hair Forecast Status";

    const HAIR_TYPES = ["straight", "wavy", "curly", "coily"];
    const HAIR_LENGTHS = ["short", "medium", "long"];
    const STYLE_OPTIONS = ["natural", "bun", "pony", "braid", "straighten", "curl"];

    const DEFAULT_CONFIG = Object.freeze({
      hair_type: "wavy",
      hair_length: "medium",
      humidity_sensitivity: 3,
      oiliness: 3,
      frizz_prone: 3,
      snark_level: 3,
      turns_per_day: 25,
    });

    const SNARK_BY_LEVEL = {
      1: [
        "Honestly manageable today.",
        "You and your hair are mostly in agreement.",
      ],
      2: [
        "Could be worse. No helmet required.",
        "Mild chaos, still photogenic.",
      ],
      3: [
        "Hair has opinions today.",
        "You vs. humidity: season finale energy.",
      ],
      4: [
        "Your strands filed a rebellion notice.",
        "The mirror is giving live commentary.",
      ],
      5: [
        "This is performance art now.",
        "Every strand chose freelance today.",
      ],
    };

    function ensureStateRoot() {
      if (typeof globalThis.state !== "object" || !globalThis.state) {
        globalThis.state = {};
      }
      return globalThis.state;
    }

    function clampInt(value, min, max, fallback) {
      const n = Number.parseInt(value, 10);
      if (!Number.isFinite(n)) return fallback;
      if (n < min) return min;
      if (n > max) return max;
      return n;
    }

    function toKeyMap(entry) {
      const out = {};
      const lines = String(entry || "").split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^\s*([a-z_]+)\s*[:=]\s*(.+?)\s*$/i);
        if (!m) continue;
        out[m[1].toLowerCase()] = m[2].trim();
      }
      return out;
    }

    function hashString(text) {
      let h = 2166136261;
      const s = String(text || "");
      for (let i = 0; i < s.length; i += 1) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function seededRng(seed) {
      let t = seed >>> 0;
      return () => {
        t += 0x6d2b79f5;
        let x = t;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    }

    function pick(list, rng) {
      return list[Math.floor(rng() * list.length)];
    }

    function findCard(title) {
      if (!Array.isArray(globalThis.storyCards)) return null;
      return globalThis.storyCards.find((card) => card.title === title) || null;
    }

    function ensureCard(title, entry, description, keys) {
      let card = findCard(title);
      if (!card && typeof addStoryCard === "function") {
        addStoryCard(title, entry, description || "");
        card = findCard(title);
      }
      if (card) {
        if (typeof description === "string") card.description = description;
        if (typeof keys === "string") card.keys = keys;
      }
      return card;
    }

    function normalizeConfig(raw) {
      const cfg = {
        hair_type: HAIR_TYPES.includes(raw.hair_type) ? raw.hair_type : DEFAULT_CONFIG.hair_type,
        hair_length: HAIR_LENGTHS.includes(raw.hair_length) ? raw.hair_length : DEFAULT_CONFIG.hair_length,
        humidity_sensitivity: clampInt(raw.humidity_sensitivity, 1, 5, DEFAULT_CONFIG.humidity_sensitivity),
        oiliness: clampInt(raw.oiliness, 1, 5, DEFAULT_CONFIG.oiliness),
        frizz_prone: clampInt(raw.frizz_prone, 1, 5, DEFAULT_CONFIG.frizz_prone),
        snark_level: clampInt(raw.snark_level, 1, 5, DEFAULT_CONFIG.snark_level),
        turns_per_day: clampInt(raw.turns_per_day, 1, 200, DEFAULT_CONFIG.turns_per_day),
      };
      return cfg;
    }

    function formatConfig(cfg) {
      return [
        `hair_type = ${cfg.hair_type}`,
        `hair_length = ${cfg.hair_length}`,
        `humidity_sensitivity = ${cfg.humidity_sensitivity}`,
        `oiliness = ${cfg.oiliness}`,
        `frizz_prone = ${cfg.frizz_prone}`,
        `snark_level = ${cfg.snark_level}`,
        `turns_per_day = ${cfg.turns_per_day}`,
      ].join("\n");
    }

    function parseConfig(entry) {
      const map = toKeyMap(entry);
      return normalizeConfig({
        hair_type: map.hair_type,
        hair_length: map.hair_length,
        humidity_sensitivity: map.humidity_sensitivity,
        oiliness: map.oiliness,
        frizz_prone: map.frizz_prone,
        snark_level: map.snark_level,
        turns_per_day: map.turns_per_day,
      });
    }

    function ensureConfigCard() {
      const description = [
        "Hair Forecast settings.",
        "Required format: key = value",
        "hair_type: straight|wavy|curly|coily",
        "hair_length: short|medium|long",
        "humidity_sensitivity: 1-5",
        "oiliness: 1-5",
        "frizz_prone: 1-5",
        "snark_level: 1-5",
        "turns_per_day: 1-200",
      ].join("\n");
      return ensureCard(CONFIG_TITLE, formatConfig(DEFAULT_CONFIG), description, "hair forecast config");
    }

    function ensureStatusCard() {
      return ensureCard(
        STATUS_TITLE,
        "Hair forecast status will update automatically.",
        "Read-only status generated by the script.",
        "hair forecast status"
      );
    }

    function getConfig() {
      const card = ensureConfigCard();
      const cfg = parseConfig(card ? card.entry : "");
      if (card && card.entry !== formatConfig(cfg)) {
        card.entry = formatConfig(cfg);
      }
      return cfg;
    }

    function setConfigPatch(patch) {
      const cfg = normalizeConfig({ ...getConfig(), ...patch });
      const card = ensureConfigCard();
      if (card) card.entry = formatConfig(cfg);
      const rt = ensureRuntime(cfg);
      refreshSnapshot(rt, cfg);
      return cfg;
    }

    function scoreToCondition(score) {
      if (score <= 1) return "low";
      if (score >= 3) return "high";
      return "med";
    }

    function scoreToSleep(score) {
      if (score <= 1) return "good";
      if (score >= 3) return "bad";
      return "meh";
    }

    function recalcForecast(snapshot) {
      const negatives = snapshot.frizz + snapshot.oil + snapshot.static;
      const positives = snapshot.volume + snapshot.definition;
      const score = positives - negatives;
      if (score >= 2) return "GOOD";
      if (score <= -3) return "BAD";
      return "CHAOTIC NEUTRAL";
    }

    function styleSuggestion(snapshot, cfg, rng) {
      const wantsControl = snapshot.frizz >= 4 || snapshot.static >= 4;
      const wantsVolumeControl = snapshot.volume >= 4 && snapshot.oil >= 4;

      let style = "natural";
      if (wantsControl && snapshot.oil >= 3) {
        style = pick(["bun", "braid"], rng);
      } else if (wantsControl) {
        style = pick(["pony", "braid", "bun"], rng);
      } else if (wantsVolumeControl) {
        style = "pony";
      } else if (snapshot.definition <= 2 && ["curly", "coily"].includes(cfg.hair_type)) {
        style = "natural";
      } else {
        style = pick(["natural", "pony", "straighten", "curl"], rng);
      }

      const asideList = SNARK_BY_LEVEL[cfg.snark_level] || SNARK_BY_LEVEL[3];
      const aside = pick(asideList, rng);

      return `${style} + light touch-up. ${aside}`;
    }

    function quickCue(snapshot, cfg) {
      if (snapshot.forecast === "BAD") {
        return cfg.snark_level >= 4
          ? "Your hands keep checking flyaways like it is a side quest."
          : "You keep fixing loose strands more often than usual.";
      }
      if (snapshot.forecast === "GOOD") {
        return "Hair behavior is mostly cooperative today.";
      }
      return "Small hair adjustments keep interrupting your focus.";
    }

    function generateDaySnapshot(day, cfg, rt) {
      const seed = hashString(`${day}|${cfg.hair_type}|${cfg.hair_length}|${cfg.humidity_sensitivity}|${cfg.oiliness}|${cfg.frizz_prone}`);
      const rng = seededRng(seed);

      const humidityScore = 1 + Math.floor(rng() * 3);
      const windScore = 1 + Math.floor(rng() * 3);
      const sleepScore = 1 + Math.floor(rng() * 3);

      const humidityPressure = humidityScore - 1;
      const windPressure = windScore - 1;
      const sleepPenalty = sleepScore - 1;

      const typeFrizzBonus = ({ straight: -1, wavy: 0, curly: 1, coily: 1 })[cfg.hair_type] || 0;
      const lengthVolumeShift = ({ short: 1, medium: 0, long: -1 })[cfg.hair_length] || 0;

      const frizz = clampInt(
        Math.round(2 + (cfg.frizz_prone - 3) + humidityPressure * (cfg.humidity_sensitivity / 3) + windPressure * 0.8 + sleepPenalty * 0.7 + typeFrizzBonus),
        1,
        5,
        3
      );

      const oil = clampInt(
        Math.round(2 + (cfg.oiliness - 3) + sleepPenalty * 0.8 + (cfg.hair_length === "long" ? 0.4 : 0)),
        1,
        5,
        3
      );

      const volume = clampInt(
        Math.round(3 + lengthVolumeShift + (windScore === 2 ? 0 : (windScore === 3 ? 1 : -1)) + (sleepScore === 1 ? 1 : 0) - (oil >= 4 ? 1 : 0)),
        1,
        5,
        3
      );

      const statik = clampInt(
        Math.round(2 + (humidityScore === 1 ? 2 : 0) + (windScore === 3 ? 1 : 0) - (humidityScore === 3 ? 1 : 0)),
        1,
        5,
        2
      );

      const definition = clampInt(
        Math.round(3 + (["curly", "coily"].includes(cfg.hair_type) ? 1 : 0) - Math.max(0, frizz - 3) - (sleepScore === 3 ? 1 : 0)),
        1,
        5,
        3
      );

      const snapshot = {
        day,
        humidity: scoreToCondition(humidityScore),
        wind: scoreToCondition(windScore),
        sleep: scoreToSleep(sleepScore),
        frizz,
        oil,
        volume,
        static: statik,
        definition,
        last_style: STYLE_OPTIONS.includes(rt.last_style) ? rt.last_style : "natural",
        forecast: "CHAOTIC NEUTRAL",
        suggestion: "",
        quick_cue: "",
      };

      snapshot.forecast = recalcForecast(snapshot);
      snapshot.suggestion = styleSuggestion(snapshot, cfg, rng);
      snapshot.quick_cue = quickCue(snapshot, cfg);
      return snapshot;
    }

    function ensureRuntime(cfg) {
      const root = ensureStateRoot();
      if (!root.hairForecast || typeof root.hairForecast !== "object") {
        root.hairForecast = {
          version: VERSION,
          day: 1,
          turn_counter: 0,
          last_style: "natural",
          day_snapshot: null,
          command_center: "",
          skip_advance_once: false,
          last_context_turn: -999,
          last_context_day: 0,
        };
      }

      const rt = root.hairForecast;
      rt.version = VERSION;
      rt.day = clampInt(rt.day, 1, 999999, 1);
      rt.turn_counter = clampInt(rt.turn_counter, 0, 99999999, 0);
      rt.last_style = STYLE_OPTIONS.includes(rt.last_style) ? rt.last_style : "natural";
      rt.command_center = String(rt.command_center || "");
      rt.skip_advance_once = rt.skip_advance_once === true;
      rt.last_context_turn = clampInt(rt.last_context_turn, -999999, 99999999, -999);
      rt.last_context_day = clampInt(rt.last_context_day, 0, 999999, 0);

      if (!rt.day_snapshot || rt.day_snapshot.day !== rt.day) {
        rt.day_snapshot = generateDaySnapshot(rt.day, cfg, rt);
      }

      return rt;
    }

    function refreshSnapshot(rt, cfg) {
      rt.day_snapshot = generateDaySnapshot(rt.day, cfg, rt);
      return rt.day_snapshot;
    }

    function applyWash() {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      const snap = rt.day_snapshot || refreshSnapshot(rt, cfg);
      snap.oil = clampInt(snap.oil - 2, 1, 5, snap.oil);
      snap.frizz = clampInt(snap.frizz - 1, 1, 5, snap.frizz);
      snap.definition = clampInt(snap.definition + 1, 1, 5, snap.definition);
      snap.forecast = recalcForecast(snap);
      const rng = seededRng(hashString(`${rt.day}|wash|${snap.last_style}`));
      snap.suggestion = styleSuggestion(snap, cfg, rng);
      snap.quick_cue = quickCue(snap, cfg);
      return snap;
    }

    function setStyle(style) {
      if (!STYLE_OPTIONS.includes(style)) return false;
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      rt.last_style = style;
      const snap = rt.day_snapshot || refreshSnapshot(rt, cfg);
      snap.last_style = style;
      const rng = seededRng(hashString(`${rt.day}|style|${style}`));
      snap.suggestion = styleSuggestion(snap, cfg, rng);
      return true;
    }

    function nextDay(step) {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      const days = clampInt(step, 1, 365, 1);
      rt.day += days;
      refreshSnapshot(rt, cfg);
      return rt.day;
    }

    function formatStatusText() {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      const snap = rt.day_snapshot || refreshSnapshot(rt, cfg);

      return [
        `Day: ${snap.day} | Forecast: ${snap.forecast}`,
        `Humidity: ${snap.humidity} | Wind: ${snap.wind} | Sleep: ${snap.sleep}`,
        `Frizz: ${snap.frizz}/5 | Oil: ${snap.oil}/5 | Volume: ${snap.volume}/5 | Static: ${snap.static}/5 | Definition: ${snap.definition}/5`,
        `Last style: ${snap.last_style}`,
        `Suggested move: ${snap.suggestion}`,
      ].join("\n");
    }

    function updateStatusCard() {
      const card = ensureStatusCard();
      if (card) card.entry = formatStatusText();
    }

    function buildContextBlock() {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      const snap = rt.day_snapshot || refreshSnapshot(rt, cfg);

      const isDayStartCue = rt.last_context_day < snap.day;
      const periodicCue = (rt.turn_counter - rt.last_context_turn) >= 5;
      if (!isDayStartCue && !periodicCue) return "";

      rt.last_context_turn = rt.turn_counter;
      rt.last_context_day = snap.day;

      return [
        "[HAIR FORECAST]",
        `Forecast: ${snap.forecast}`,
        `Quick cue: ${snap.quick_cue}`,
        "",
      ].join("\n");
    }

    function advanceTurn() {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);

      if (rt.skip_advance_once) {
        rt.skip_advance_once = false;
        return { advanced: false, new_day: false };
      }

      rt.turn_counter += 1;
      if (rt.turn_counter % cfg.turns_per_day !== 0) {
        return { advanced: false, new_day: false };
      }

      rt.day += 1;
      refreshSnapshot(rt, cfg);
      return { advanced: true, new_day: true };
    }

    function initialize() {
      const cfg = getConfig();
      const rt = ensureRuntime(cfg);
      ensureStatusCard();
      if (!rt.day_snapshot || rt.day_snapshot.day !== rt.day) {
        refreshSnapshot(rt, cfg);
      }
      updateStatusCard();
    }

    function markCommandMessage(message) {
      const rt = ensureRuntime(getConfig());
      rt.command_center = String(message || "");
      rt.skip_advance_once = true;
      updateStatusCard();
    }

    function getRuntime() {
      return ensureRuntime(getConfig());
    }

    return {
      VERSION,
      CONFIG_TITLE,
      STATUS_TITLE,
      HAIR_TYPES,
      HAIR_LENGTHS,
      STYLE_OPTIONS,
      initialize,
      getRuntime,
      getConfig,
      setConfigPatch,
      setStyle,
      nextDay,
      applyWash,
      formatStatusText,
      updateStatusCard,
      buildContextBlock,
      markCommandMessage,
      advanceTurn,
    };
  })();
}

function onLibrary_HairForecast() {
  if (!globalThis.HairForecast) return;
  HairForecast.initialize();
}

onLibrary_HairForecast();
