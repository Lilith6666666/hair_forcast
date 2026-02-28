// Open source — authored by Lilith6666666

onLibrary_HairForecast();

const modifier = (text) => {
  onLibrary_HairForecast();

  const block = HairForecast.buildContextBlock();
  const result = { text: `${block}${String(text || "")}` };
  if (typeof stop !== "undefined") {
    result.stop = stop;
  }
  return result;
};

modifier(text);
