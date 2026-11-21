// spoiler.js: the spoiler shield. While it is on, a hidden trophy not yet earned shows a neutral label, not its name.
export function isShielded(trophy, progress) {
  return progress.spoiler && trophy.hidden && !progress.earned[trophy.id];
}

export function shownText(trophy, progress) {
  if (!isShielded(trophy, progress)) return { name: trophy.name, description: trophy.description, masked: false };
  const where = trophy.chapter ? ` · ${trophy.chapter}` : '';
  return {
    name: `Hidden ${trophy.kind} trophy #${trophy.id}`,
    description: `Spoiler shield on${where}. Earn it or switch the shield off to read it.`,
    masked: true,
  };
}
