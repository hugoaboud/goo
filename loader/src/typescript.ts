import { GooAttribute } from "./html";

export function parseCode(code: string) {
    return code
        .replace(/'/g,'\\\'')
        .replace(/\n/g,'\\n');
}

export function parseCondition(attr: Extract<GooAttribute, { type: 'if' }>) {
    return attr.prop === '_'
        ? `(${attr.value})`
        : attr.value !== undefined
            ? `(this.${attr.prop} === ${attr.value})`
            : `(!!this.${attr.prop})`;
}

export function makeSetup(attributes: Record<string, GooAttribute[]>) {
    
    const setup: string[] = [];

    for (const id in attributes) {
        setup.push(`this.addGooNode('${id}');`);

        // text
        for (const attr of attributes[id]!) {
            if (attr.type !== 'text') continue;
            setup.push(`this.$${id}._setupText(${attr.pos}, '${attr.template}');`);
        }

        // if
        const if_attrs = attributes[id]!.filter(attr => attr.type === 'if');
        if (if_attrs.length) {
            const conditions = if_attrs
                .map(attr => parseCondition(attr))
                .join(' && ');
            setup.push(`this.$${id}._setupIf(\'${conditions}\');`);
        }

        // set
        const set_attrs = attributes[id]!.filter(attr => attr.type === 'set' && attr.prop !== 'class') as Extract<GooAttribute, { type: 'set' }>[];
        for (const attr of set_attrs) {
            setup.push(`this.$${id}._setupSet(\'${attr.prop}\', \'${attr.code}\');`);
        }

        // set class
        const set_class_attr = attributes[id]!.find(attr => attr.type === 'set' && attr.prop === 'class') as Extract<GooAttribute, { type: 'set' }>;
        if (set_class_attr) {
            setup.push(`this.$${id}._setupSetClass(\'${set_class_attr.code}\');`);
        }

        // for
        const for_attr = attributes[id]!.find(attr => attr.type === 'for') as Extract<GooAttribute, { type: 'for' }>;
        if (for_attr) {
            setup.push(`this.$${id}._setupFor(\'${for_attr.var}\', \'${for_attr.iterator}\');`);
        }

        // on
        for (const attr of attributes[id]!) {
            if (attr.type !== 'on') continue;
            setup.push(`this.$${id}._setupOn('${attr.event}', \'${attr.code}\');`);
        }
    }
    
    return setup.join('\n')+'\n';
}