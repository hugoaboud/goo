import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { parseHtml as libParseHtml } from '@quimblos/goo/src/html';

const xmlns = {
    'on': '__goo_on',
    'if': '__goo_if',
    'for': '__goo_for',
    'set': '__goo_set',
    'with': '__goo_with',
    'bind': '__goo_bind',
}

export function parseHtml(source: string) {
    const parser = new DOMParser({
        errorHandler: {
            warning: () => {
                // Suppress warnings
                // TODO: make this specific to the "no value for attribute" warning
            },
        },
        xmlns
    } as any);
    const document = parser.parseFromString(`<goo>${source}</goo>`, 'text/xml');
    const root = document.documentElement;
    if (!root) return { source, attributes: {} };

    const attributes = libParseHtml(root);

    const serializer = new XMLSerializer();
    const out = serializer.serializeToString(document);

    let clean_out = out.match(/^<\W*?goo.*?\>(.*?)(<\/\W*goo\W*>)?$/s)?.[1] ?? '[Error]';
    
    // Unwrap self-closing tags - from user input and from
    // the output of xmldom.
    // (No longer supported on HTML4+)
    clean_out = clean_out.replace(/<([\w-]+)([^>]*)\/>/gs,'<$1$2></$1>');

    return { source: clean_out, attributes };
}
