import { parseHtml } from "../src/html";

describe('html', () => {

    describe('${text}', () => {    
        it('should parse ${} template text', () => {
            const { source, attributes } = parseHtml(''
                + '<div>${this.color}</div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'text',
                    template: '${this.color}'
                }
            ]})
        })
        it('should parse multiple ${} template texts', () => {
            const { source, attributes } = parseHtml(''
                + '<div>${this.color} and ${this.size}</div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'text',
                    template: '${this.color} and ${this.size}'
                }
            ]})
        })
        it('should parse multiple ${} template texts', () => {
            const { source, attributes } = parseHtml(''
                + '<div>\n'
                + '  ${this.menu}\n'
                + '</div>\n'
            );
            expect(source).toEqual('<div id="_goo_1"/>\n')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'text',
                    template: '${this.menu}'
                }
            ]})
        })
    })

    describe('on:###', () => {    
        it('should parse on:### attribute', () => {
            const { source, attributes } = parseHtml(''
                + '<div on:click="run"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'on',
                    event: 'click',
                    code: 'this.run()'
                }
            ]})
        })
    
        it('should parse on:### attribute with given id', () => {
            const { source, attributes } = parseHtml(''
                + '<div id="my_btn" on:click="run"></div>'
            );
            expect(source).toEqual('<div id="my_btn"/>')
            expect(attributes).toEqual({
                'my_btn': [
                {
                    type: 'on',
                    event: 'click',
                    code: 'this.run()'
                }
            ]})
        })
    
        it('should parse multiple on:### attributes', () => {
            const { source, attributes } = parseHtml(''
                + '<div on:hover="prepare" on:click="run"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'on',
                    event: 'hover',
                    code: 'this.prepare()'
                },
                {
                    type: 'on',
                    event: 'click',
                    code: 'this.run()'
                }
            ]})
        })
    })
    
    describe('if:###', () => {    
        it('should parse if:### attribute', () => {
            const { source, attributes } = parseHtml(''
                + '<div if:color="\'red\'"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'if',
                    prop: 'color',
                    value: '\'red\''
                }
            ]})
        })

        it('should parse if:### attribute without value', () => {
            const { source, attributes } = parseHtml(''
                + '<div if:color></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'if',
                    prop: 'color',
                    value: undefined
                }
            ]})
        })

        it('should parse if:_ attribute', () => {
            const { source, attributes } = parseHtml(''
                + '<div if:_="this.color = 3"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'if',
                    prop: '_',
                    value: 'this.color = 3'
                }
            ]})
        })
    
        it('should parse if:### attribute with given id', () => {
            const { source, attributes } = parseHtml(''
                + '<div id="my_btn" if:color="\'red\'"></div>'
            );
            expect(source).toEqual('<div id="my_btn"/>')
            expect(attributes).toEqual({
                'my_btn': [
                {
                    type: 'if',
                    prop: 'color',
                    value: '\'red\''
                }
            ]})
        })
    
        it('should parse multiple if:### attributes', () => {
            const { source, attributes } = parseHtml(''
                + '<div if:state="\'open\'" if:color="\'red\'"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'if',
                    prop: 'state',
                    value: '\'open\''
                },
                {
                    type: 'if',
                    prop: 'color',
                    value: '\'red\''
                }
            ]})
        })
    })
    
    describe('set:###', () => {    
        it('should parse set:### attribute', () => {
            const { source, attributes } = parseHtml(''
                + '<div set:class="this.glow ? \'glow\' : \'\'"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'set',
                    prop: 'class',
                    code: 'this.glow ? \'glow\' : \'\''
                }
            ]})
        })
    
        it('should parse set:### attribute with given id', () => {
            const { source, attributes } = parseHtml(''
                + '<div id="my_btn" set:class="this.glow ? \'glow\' : \'\'"></div>'
            );
            expect(source).toEqual('<div id="my_btn"/>')
            expect(attributes).toEqual({
                'my_btn': [
                {
                    type: 'set',
                    prop: 'class',
                    code: 'this.glow ? \'glow\' : \'\''
                }
            ]})
        })

        it('should parse multiple set:### attributes', () => {
            const { source, attributes } = parseHtml(''
                + '<div set:state="\'open\'" set:color="\'red\'"></div>'
            );
            expect(source).toEqual('<div id="_goo_1"/>')
            expect(attributes).toEqual({
                '_goo_1': [
                {
                    type: 'set',
                    prop: 'state',
                    code: '\'open\''
                },
                {
                    type: 'set',
                    prop: 'color',
                    code: '\'red\''
                }
            ]})
        })
    })
})