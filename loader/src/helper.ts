export function capitalize(name: string) {
  let out = '';
  let cap = true;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === '-') {
      cap = true;
    }
    else {
      if (cap) out += name[i]!.toUpperCase();
      else out += name[i];
      cap = false;
    }
  }
  return out;
}

export function sanitizeString(source?: string) {
    if (!source) return undefined;
    return source
        .replace(/'/g,'\\\'')
        .replace(/\n/g, '\\n');
}