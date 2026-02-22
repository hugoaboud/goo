import { GooAttribute } from "@quimblos/goo/src/attr";
import { parseCondition } from "@quimblos/goo/src/setup";

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

        // set
        const with_attrs = attributes[id]!.filter(attr => attr.type === 'with' && attr.prop !== 'class') as Extract<GooAttribute, { type: 'with' }>[];
        for (const attr of with_attrs) {
            setup.push(`this.nodes['${id}']._setupWith(\'${attr.prop}\', \'${attr.code}\');`);
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

        // bind:as
        const bind_as_attr = attributes[id]!.find(attr => attr.type === 'bind');
        if (bind_as_attr) {
            setup.push(`this.nodes['${id}']._setupBindAs(\'${bind_as_attr.var}\');`);
        }

        // slot
        const slot_attr = attributes[id]!.find(attr => attr.type === 'slot');
        if (slot_attr) {
            setup.push(`this.nodes['${id}']._setupSlot(\'${slot_attr.name}\');`);
        }

        // slot-instance
        const slot_instance_attr = attributes[id]!.find(attr => attr.type === 'slot-instance');
        if (slot_instance_attr) {
            setup.push(`this.nodes['${id}']._setupSlotInstance(\'${slot_instance_attr.name}\');`);
        }
    }
    
    return {
        link: link.join('\n')+'\n',
        setup: setup.join('\n')+'\n'
    }
}