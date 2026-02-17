import { GooAttribute } from "./html";

export function parseImplicitReturn(code: string) {
    if (!code.startsWith('this.')) {
        code = 'this.' + code;
    }
    if (!code.endsWith(')')) {
        code = code + '()';
    }
    return code;
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
        setup.push(`this.$${id} = shadowRoot.querySelector('#${id}');`);

        for (const attr of attributes[id]!) {

            switch (attr.type) {
                case 'text':
                    setup.push(`this.$${id}.renderText = () => { this.$${id}.textContent = \`${attr.template}\`; }`);
                    break;
                case 'on':
                    setup.push(`this.$${id}.addEventListener('${attr.event}', () => ${attr.code});`);
                    break;
                case 'if':
                    setup.push(`this.$${id}.__goo_display = this.$${id}.style.display;`);
                    break;
                case 'set':
                    if (attr.prop === 'class') {
                        setup.push(`this.$${id}.__goo_raw_class = this.$${id}.className ?? '';`);
                    }
                    break;
            }

        }

        if (id.startsWith('_goo_')) {
            setup.push(`this.$${id}.removeAttribute('id');`);
        }
    }
    
    return setup.join('\n')+'\n';
}

export function makeRender(attributes: Record<string, GooAttribute[]>) {
    const render: string[] = [];

    for (const id in attributes) {

        // if
        const if_attrs = attributes[id]!.filter(attr => attr.type === 'if');
        if (if_attrs.length) {
            const conditions = if_attrs
                .map(attr => parseCondition(attr))
                .join(' && ');

            render.push('if (' + conditions + ') {');
            render.push(`  this.$${id}.style.display = this.$${id}.__goo_display;`);
            render.push('} else {');
            render.push(`  this.$${id}.style.display = 'none';`);
            render.push('}');
        }


        // set
        const set_attrs = attributes[id]!.filter(attr => attr.type === 'set');
        if (set_attrs.length) {
            for (const attr of set_attrs) {
                if (attr.prop === 'class') {
                    render.push(`this.$${id}.className = this.$${id}.__goo_raw_class + ' ' + (${attr.code});`);
                }
                else {
                    render.push(`this.$${id}.setAttribute('${attr.prop}', ${attr.code})`);
                }
            }
        }

        // text
        const text_attr = attributes[id]!.find(attr => attr.type === 'text');
        if (text_attr) {
            render.push(`this.$${id}.renderText();`);
        }

    }
    
    return render.join('\n')+'\n'
}