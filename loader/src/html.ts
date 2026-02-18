import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { parseCode } from './typescript';
import { JSDOM } from 'jsdom';

const xmlns = {
    'on': '__goo_on',
    'if': '__goo_if',
    'for': '__goo_for',
    'set': '__goo_set',
}

export type GooAttribute =
{
    type: 'text'
    pos: number
    template: string
} | {
    type: 'if'
    prop: string
    value: string | undefined
} | {
    type: 'set'
    prop: string
    code: string
} | {
    type: 'on'
    event: string
    code: string
} | {
    type: 'for'
    var: string
    iterator: string
}

function parseText(node: { data: string }, parent_id: string, pos: number): (GooAttribute & { id: string}) | undefined {
    const text = node.data;
    const has_template = text.match(/\${.*?}/);
    if (!has_template) return;

    node.data = ' ';

    return {
        id: parent_id,
        type: 'text',
        pos,
        template: parseCode(text.trim())
    };
} 

function parseNode(node: HTMLElement, node_i: number) {
    const attributes: (GooAttribute & { id: string})[] = [];

    const orig_id = node.getAttribute('id');
    const id = orig_id?.length ? orig_id : `_goo_${node_i}`;

    const attrs = Array.from(node.attributes);
    if (attrs.length) {
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]!;
            if (!attr.namespaceURI) continue;
            if (!Object.values(xmlns).includes(attr.namespaceURI)) continue;

            switch (attr.namespaceURI) {
                case '__goo_if':
                    attributes.push({
                        type: 'if',
                        id,
                        prop: attr.name.replace(/^if:/,''),
                        value: attr.value === attr.name
                            ? undefined
                            : parseCode(attr.value)
                    })
                    break;
                case '__goo_set':
                    attributes.push({
                        type: 'set',
                        id,
                        prop: attr.name.replace(/^set:/,''),
                        code: parseCode(attr.value)
                    })
                    break;
                case '__goo_on':
                    attributes.push({
                        type: 'on',
                        id,
                        event: attr.name.replace(/^on:/,''),
                        code: parseCode(attr.value)
                    })
                    break;
                case '__goo_for':
                    attributes.push({
                        type: 'for',
                        id,
                        var: attr.name.replace(/^for:/,''),
                        iterator: attr.value
                    })
                    break;
            }
            node.removeAttribute(attr.name);
        }
    }

    // // TODO: support multiple text children
    // let text_child = Array.from(node.childNodes)
    //     .find(child => child.nodeName === '#text');
        
    // if (text_child) {
    //     const text_attribute = parseText(node, (text_child as any).data, id);
    //     if (text_attribute) {
    //         attributes.push(text_attribute);
    //     }
    // }

    return { id, attributes };
}

export function parseHtml(source: string) {
    
    // describeHtml('[source]', source)

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

    const all_attributes: (GooAttribute & { id: string})[] = [];

    let node_i = 0;
    const parse = (node: HTMLElement, parent?: HTMLElement, parent_id?: string, pos?: number) => {
        // [Comment]
        if (node.nodeName === '#comment') {
            return 0
        }
        // [Text]
        if (node.nodeName === '#text') {
            // (some?) Browsers remove empty text nodes, so we do this preemptively
            // to keep indexes matching between static analysis
            // and the actual webcomponent.
            if ((node as any).data.trim().length === 0) {
                parent!.removeChild(node);
                return -1;
            }
            const attribute = parseText(node as any, parent_id!, pos!)
            if (attribute) {
                all_attributes.push(attribute);
                parent!.setAttribute('id', parent_id!);
            }
            return 0;
        }
        // [Element]
        else {
            const { id, attributes } = parseNode(node, node_i);
            all_attributes.push(...attributes);
            node_i++;
            if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i]!;
                    i += parse(child as HTMLElement, node, id, i);
                }
            }
            if (attributes.length) {
                node.setAttribute('id', id);
            }
        }
        return 0;
    }
    parse(root);

    const serializer = new XMLSerializer();
    const out = serializer.serializeToString(document);

    let clean_out = out.match(/^<\W*?goo.*?\>(.*?)(<\/\W*goo\W*>)?$/s)?.[1] ?? '[Error]';

    // Unwrap self-closing tags - from user input and from
    // the output of xmldom.
    // (No longer supported on HTML4+)
    clean_out = clean_out.replace(/<(\w+)([^>]*)\/>/gs,'<$1$2></$1>');

    // describeHtml('[clean_out]', clean_out)

    // console.log({
    //     a: source,
    //     b: serializer.serializeToString(document),
    //     c: out,
    //     d: clean_out
    // })
    
    const attributes: Record<string, GooAttribute[]> = {};
    for (const { id, ...attr } of all_attributes) {
        attributes[id] ??= []
        attributes[id]!.push(attr);
    }

    return { source: clean_out, attributes };
}

export function describeHtml(title: string, source: string) {
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

    console.log(title);

    const walk = (node: HTMLElement, debug_d = 0) => {
        if (node.nodeName === '#comment') {
            return
        }
        if (node.nodeName === '#text') {
            return
        }
        if (node.childNodes) {
            const pad = ' '.repeat(debug_d*2);
            console.log(`${pad}${node.nodeName}`);
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i]!;
                console.log(`${pad} [${i}]${child.nodeName}`);
                walk(child as HTMLElement, debug_d+1);
            }
        }        
    }
    walk(root);
}