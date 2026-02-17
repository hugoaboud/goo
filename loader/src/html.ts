import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { parseImplicitReturn } from './typescript';

const xmlns = {
    'on': '__goo_on',
    'if': '__goo_if',
    'set': '__goo_set',
}

export type GooAttribute =
{
    type: 'text'
    template: string
} | {
    type: 'on'
    event: string
    code: string
} | {
    type: 'if'
    prop: string
    value: string | undefined
} | {
    type: 'set'
    prop: string
    code: string
}

function parseText(node: HTMLElement, text: string, id: string): (GooAttribute & { id: string}) | undefined {
    const has_template = text.match(/\${.*?}/);
    if (!has_template) return;

    node.textContent = '';

    return {
        id,
        type: 'text',
        template: text.trim()
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
                case '__goo_on':
                    attributes.push({
                        type: 'on',
                        id,
                        event: attr.name.replace(/^on:/,''),
                        code: parseImplicitReturn(attr.value)
                    })
                    break;
                case '__goo_if':
                    attributes.push({
                        type: 'if',
                        id,
                        prop: attr.name.replace(/^if:/,''),
                        value: attr.value === attr.name
                            ? undefined
                            : attr.value
                    })
                    break;
                case '__goo_set':
                    attributes.push({
                        type: 'set',
                        id,
                        prop: attr.name.replace(/^set:/,''),
                        code: attr.value
                    })
                    break;
            }
            node.removeAttribute(attr.name);
        }
    }

    // TODO: support multiple text children
    let text_child = Array.from(node.childNodes)
        .find(child => child.nodeName === '#text');
        
    if (text_child) {
        const text_attribute = parseText(node, (text_child as any).data, id);
        if (text_attribute) {
            attributes.push(text_attribute);
        }
    }

    if (attributes.length) {
        node.setAttribute('id', id);
    }

    return attributes;
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

    const all_attributes: (GooAttribute & { id: string})[] = [];

    let node_i = 0;
    const parse = (node: HTMLElement) => {
        // [Comment]
        if (node.nodeName === '#comment') {
            return
        }
        // [Text]
        if (node.nodeName === '#text') {
            return
        }
        // [Node]
        else {
            const attributes = parseNode(node, node_i);
            all_attributes.push(...attributes);
            node_i++;
            if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    parse(child as HTMLElement);
                }
            }
        }        
    }
    parse(root);

    const serializer = new XMLSerializer();
    const pad = '<goo>'.length;
    const out = serializer.serializeToString(document)
        .slice(pad,-pad-1);
    

    const attributes: Record<string, GooAttribute[]> = {};
    for (const { id, ...attr } of all_attributes) {
        attributes[id] ??= []
        attributes[id]!.push(attr);
    }

    return { source: out, attributes };
}