// import { validate } from "schema-utils";
import * as path from 'path';
import { extractSFC } from './src/extract';
import { capitalize, sanitizeString } from './src/helper';
import { parseHtml } from './src/html';
import { makeSetup } from './src/typescript';
import { makeWebComponent } from './src/webc';

export default function loader(this: {resourcePath: string}, source: string) {
//   const options = this.getOptions();
//   validate(schema, options, {
//     name: "Example Loader",
//     baseDataPath: "options",
//   });

  const filename = path.basename(this.resourcePath);
  const raw_name = filename.replace(/.goo$/,'');
  if (!filename.endsWith('.goo')) return;
  
  const name = capitalize(raw_name);
  const tag = raw_name;

  const raw = extractSFC(source);
  const html = raw.html ? parseHtml(raw.html) : undefined;

  const setup = html?.attributes ? makeSetup(html.attributes) : undefined;

  const webc = makeWebComponent(
    /* name */            name,
    /* tag */             tag,
    /* content */         sanitizeString(html?.source),
    /* style */           sanitizeString(raw.css),
    /* is_global_style */ raw.css_options?.includes('global') ?? false,
    /* class_def */       raw.ts,
    /* goo_setup */       setup
  );

  return webc;
}