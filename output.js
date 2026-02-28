// Open source — authored by Lilith6666666

onLibrary_HairForecast();

const modifier = (text) => {
  onLibrary_HairForecast();

  const rt = HairForecast.getRuntime();
  const commandMessage = String(rt.command_center || "").trim();
  if (commandMessage) {
    rt.command_center = "";
    HairForecast.updateStatusCard();
    return { text: commandMessage };
  }

  const movement = HairForecast.advanceTurn();
  HairForecast.updateStatusCard();

  let output = String(text || "");
  if (movement.new_day) {
    const statusLine = HairForecast.formatStatusText().split(/\r?\n/)[0];
    output += `\n\n<< Hair Forecast: ${statusLine} >>`;
  }

  return { text: output };
};

modifier(text);
