import { GooAttribute } from "@goo/lib/src/attr";
import { parseCondition } from "@goo/lib/src/setup";

export function makeSetup(attributes: Record<string, GooAttribute[]>) {
    
    const link: string[] = [];
    const setup: string[] = [];

    for (const id in attributes) {
        link.push(`this.addGooNode('${id}');`);

        // text
        for (const attr of attributes[id]!) {
            if (attr.type !== 'text') continue;
            setup.push(`this.nodes['${id}']._setupText(${attr.pos}, '${attr.template}');`);
        }

        // if
        const if_attrs = attributes[id]!.filter(attr => attr.type === 'if');
        if (if_attrs.length) {
            const conditions = if_attrs
                .map(attr => parseCondition(attr))
                .join(' && ');
            setup.push(`this.nodes['${id}']._setupIf(\'${conditions}\');`);
        }

        // set
        const set_attrs = attributes[id]!.filter(attr => attr.type === 'set' && attr.prop !== 'class') as Extract<GooAttribute, { type: 'set' }>[];
        for (const attr of set_attrs) {
            setup.push(`this.nodes['${id}']._setupSet(\'${attr.prop}\', \'${attr.code}\');`);
        }

        // set class
        const set_class_attr = attributes[id]!.find(attr => attr.type === 'set' && attr.prop === 'class') as Extract<GooAttribute, { type: 'set' }>;
        if (set_class_attr) {
            setup.push(`this.nodes['${id}']._setupSetClass(\'${set_class_attr.code}\');`);
        }

        // on
        for (const attr of attributes[id]!) {
            if (attr.type !== 'on') continue;
            setup.push(`this.nodes['${id}']._setupOn('${attr.event}', \'${attr.code}\');`);
        }
        
        // for
        const for_attr = attributes[id]!.find(attr => attr.type === 'for');
        if (for_attr) {
            setup.push(`this.nodes['${id}']._setupFor(\'${for_attr.var}\', \'${for_attr.iterator}\');`);
        }

        // this:as
        const this_as_attr = attributes[id]!.find(attr => attr.type === 'this');
        if (this_as_attr) {
            setup.push(`this.nodes['${id}']._setupThisAs(\'${this_as_attr.var}\');`);
        }
    }
    
    return {
        link: link.join('\n')+'\n',
        setup: setup.join('\n')+'\n'
    }
}