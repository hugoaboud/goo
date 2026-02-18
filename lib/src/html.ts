import { GooAttribute } from "./attr";

function parseCode(code: string) {
    return code
        .replace(/'/g,'\\\'')
        .replace(/\n/g,'\\n');
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
            const ns_name = attr.name.split(':');
            if (ns_name.length !== 2) continue;

            switch (ns_name[0]) {
                case 'if':
                    attributes.push({
                        type: 'if',
                        id,
                        prop: ns_name[1]!,
                        value: attr.value === attr.name
                            ? undefined
                            : parseCode(attr.value)
                    })
                    break;
                case 'set':
                    attributes.push({
                        type: 'set',
                        id,
                        prop: ns_name[1]!,
                        code: parseCode(attr.value)
                    })
                    break;
                case 'on':
                    attributes.push({
                        type: 'on',
                        id,
                        event: ns_name[1]!,
                        code: parseCode(attr.value)
                    })
                    break;
                case 'for':
                    attributes.push({
                        type: 'for',
                        id,
                        var: ns_name[1]!,
                        iterator: attr.value
                    })
                    break;
                case 'this':
                    attributes.push({
                        type: 'this',
                        id,
                        var: attr.value
                    })
                    break;
            }
            node.removeAttribute(attr.name);
        }
    }

    return { id, attributes };
}

export function parseHtml(root: HTMLElement) {
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

    // Children attributes must be setup first,
    // so context-altering attributes on the parent have
    // all children methods declared.
    all_attributes.reverse();

    const attributes: Record<string, GooAttribute[]> = {};
    for (const { id, ...attr } of all_attributes) {
        attributes[id] ??= []
        attributes[id]!.push(attr);
    }

    return attributes;
}