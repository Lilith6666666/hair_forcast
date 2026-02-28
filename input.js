// Open source — authored by Lilith6666666

onLibrary_HairForecast();

const modifier = (text) => {
  onLibrary_HairForecast();

  const input = String(text || "");
  const cmd = input.trim();
  if (!/^\/hair\b/i.test(cmd)) {
    return { text: input };
  }

  let response = "";

  if (/^\/hair\s*$/i.test(cmd) || /^\/hair\s+help$/i.test(cmd)) {
    response = [
      "Hair commands:",
      "- /hair status",
      "- /hair set type <straight|wavy|curly|coily>",
      "- /hair set length <short|medium|long>",
      "- /hair set frizz <1-5>",
      "- /hair set oil <1-5>",
      "- /hair set humidity <1-5>",
      "- /hair set snark <1-5>",
      "- /hair wash",
      "- /hair style <natural|bun|pony|braid|straighten|curl>",
      "- /hair nextday [N]",
    ].join("\n");
  } else if (/^\/hair\s+status$/i.test(cmd)) {
    response = HairForecast.formatStatusText();
  } else {
    const setType = cmd.match(/^\/hair\s+set\s+type\s+([a-z]+)$/i);
    const setLength = cmd.match(/^\/hair\s+set\s+length\s+([a-z]+)$/i);
    const setFrizz = cmd.match(/^\/hair\s+set\s+frizz\s+([1-5])$/i);
    const setOil = cmd.match(/^\/hair\s+set\s+oil\s+([1-5])$/i);
    const setHumidity = cmd.match(/^\/hair\s+set\s+humidity\s+([1-5])$/i);
    const setSnark = cmd.match(/^\/hair\s+set\s+snark\s+([1-5])$/i);
    const wash = /^\/hair\s+wash$/i.test(cmd);
    const style = cmd.match(/^\/hair\s+style\s+([a-z]+)$/i);
    const nextDay = cmd.match(/^\/hair\s+nextday(?:\s+(\d+))?$/i);

    if (setType) {
      const value = setType[1].toLowerCase();
      if (!HairForecast.HAIR_TYPES.includes(value)) {
        response = "Invalid type. Use straight|wavy|curly|coily.";
      } else {
        HairForecast.setConfigPatch({ hair_type: value });
        response = `Updated hair_type to ${value}.`;
      }
    } else if (setLength) {
      const value = setLength[1].toLowerCase();
      if (!HairForecast.HAIR_LENGTHS.includes(value)) {
        response = "Invalid length. Use short|medium|long.";
      } else {
        HairForecast.setConfigPatch({ hair_length: value });
        response = `Updated hair_length to ${value}.`;
      }
    } else if (setFrizz) {
      HairForecast.setConfigPatch({ frizz_prone: Number.parseInt(setFrizz[1], 10) });
      response = "Updated frizz_prone.";
    } else if (setOil) {
      HairForecast.setConfigPatch({ oiliness: Number.parseInt(setOil[1], 10) });
      response = "Updated oiliness.";
    } else if (setHumidity) {
      HairForecast.setConfigPatch({ humidity_sensitivity: Number.parseInt(setHumidity[1], 10) });
      response = "Updated humidity_sensitivity.";
    } else if (setSnark) {
      HairForecast.setConfigPatch({ snark_level: Number.parseInt(setSnark[1], 10) });
      response = "Updated snark_level.";
    } else if (wash) {
      HairForecast.applyWash();
      response = "Hair washed: oil and frizz reduced.";
    } else if (style) {
      const styleValue = style[1].toLowerCase();
      if (!HairForecast.setStyle(styleValue)) {
        response = "Invalid style. Use natural|bun|pony|braid|straighten|curl.";
      } else {
        response = `Set style to ${styleValue}.`;
      }
    } else if (nextDay) {
      const days = Number.parseInt(nextDay[1] || "1", 10);
      const now = HairForecast.nextDay(days);
      response = `Advanced ${days} day(s). Current day: ${now}.`;
    } else {
      response = "Unknown command. Use /hair help.";
    }
  }

  HairForecast.markCommandMessage(`<< Hair Forecast >>\n${response}`);
  return { text: " " };
};

modifier(text);
