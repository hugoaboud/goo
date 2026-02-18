/**
 * This code is a modified duplicate from the loader,
 * to reduce build size.
 */

import { GooWebComponent } from "..";
import { GooAttribute } from "./attr";

export function parseCondition(attr: Extract<GooAttribute, { type: 'if' }>) {
    return attr.prop === '_'
        ? `(${attr.value})`
        : attr.value !== undefined
            ? `(this.${attr.prop} === ${attr.value})`
            : `(!!this.${attr.prop})`;
}

export function setup(webc: GooWebComponent, attributes: Record<string, GooAttribute[]>) {
    for (const id in attributes) {
        (webc as any).addGooNode(id, webc);
    }
    
    for (let i = 0; i < webc.childNodes.length; i++) {
        (webc as any).buildNodeTree(webc.childNodes[i]);
    }

    for (const id in attributes) {

        // text
        for (const attr of attributes[id]!) {
            if (attr.type !== 'text') continue;
            (webc as any).nodes[id]._setupText(attr.pos, attr.template);
        }

        // if
        const if_attrs = attributes[id]!.filter(attr => attr.type === 'if');
        if (if_attrs.length) {
            const conditions = if_attrs
                .map(attr => parseCondition(attr))
                .join(' && ');
            (webc as any).nodes[id]._setupIf(conditions);
        }

        // set
        const set_attrs = attributes[id]!.filter(attr => attr.type === 'set' && attr.prop !== 'class') as Extract<GooAttribute, { type: 'set' }>[];
        for (const attr of set_attrs) {
            (webc as any).nodes[id]._setupSet(attr.prop, attr.code);
        }

        // set class
        const set_class_attr = attributes[id]!.find(attr => attr.type === 'set' && attr.prop === 'class') as Extract<GooAttribute, { type: 'set' }>;
        if (set_class_attr) {
            (webc as any).nodes[id]._setupSetClass(set_class_attr.code);
        }

        // on
        for (const attr of attributes[id]!) {
            if (attr.type !== 'on') continue;
            (webc as any).nodes[id]._setupOn(attr.event, attr.code);
        }
        
        // for
        const for_attr = attributes[id]!.find(attr => attr.type === 'for');
        if (for_attr) {
            (webc as any).nodes[id]._setupFor(for_attr.var, for_attr.iterator);
        }

        // this:as
        const this_as_attr = attributes[id]!.find(attr => attr.type === 'this');
        if (this_as_attr) {
            (webc as any).nodes[id]._setupThisAs(this_as_attr.var);
        }
    }
}