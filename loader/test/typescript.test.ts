import { makeRender, makeSetup } from "../src/typescript";

describe('typescript', () => {

    describe('setup', () => {
        it('should add render method for text attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'text',
                        template: '${this.color}'
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.$_goo_1 = shadowRoot.querySelector(\'#_goo_1\');\n'
                + 'this.$_goo_1.renderText = () => { this.$_goo_1.textContent = `${this.color}`; }\n'
                + 'this.$_goo_1.removeAttribute(\'id\');\n'
            )
        })
        it('should add event listener for on:### attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'on',
                        event: 'click',
                        code: 'this.run()'
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.$_goo_1 = shadowRoot.querySelector(\'#_goo_1\');\n'
                + 'this.$_goo_1.addEventListener(\'click\', () => this.run());\n'
                + 'this.$_goo_1.removeAttribute(\'id\');\n'
            )
        })
        it('should save raw style.display for if:### attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'if',
                        prop: 'color',
                        value: 'red'
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.$_goo_1 = shadowRoot.querySelector(\'#_goo_1\');\n'
                + 'this.$_goo_1.__goo_display = this.$_goo_1.style.display;\n'
                + 'this.$_goo_1.removeAttribute(\'id\');\n'
            )
        })
        it('should save raw classList for set:class attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'set',
                        prop: 'class',
                        code: 'this.open ? \'shine\' : \'\''
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.$_goo_1 = shadowRoot.querySelector(\'#_goo_1\');\n'
                + 'this.$_goo_1.__goo_raw_class = this.$_goo_1.className ?? \'\';\n'
                + 'this.$_goo_1.removeAttribute(\'id\');\n'
            )
        })
    })

    describe('render ${}', () => {
        it('should add condition for ${} attribute', () => {
            const render = makeRender({
                '_goo_1': [
                    {
                        type: 'text',
                        template: '${this.color}'
                    }
                ]
            })
            expect(render).toEqual(''
                + 'this.$_goo_1.renderText();\n'
            )
        })
    })

    describe('render if:###', () => {
        it('should add condition for if:### attribute', () => {
            const render = makeRender({
                '_goo_1': [
                    {
                        type: 'if',
                        prop: 'color',
                        value: '\'red\''
                    }
                ]
            })
            expect(render).toEqual(''
                + 'if ((this.color === \'red\')) {\n'
                + '  this.$_goo_1.style.display = this.$_goo_1.__goo_display;\n'
                + '} else {\n'
                + '  this.$_goo_1.style.display = \'none\';\n'
                + '}\n'
            )
        })

        it('should add condition for if:### attribute without value', () => {
            const render = makeRender({
                '_goo_1': [
                    {
                        type: 'if',
                        prop: 'open',
                        value: undefined
                    }
                ]
            })
            expect(render).toEqual(''
                + 'if ((!!this.open)) {\n'
                + '  this.$_goo_1.style.display = this.$_goo_1.__goo_display;\n'
                + '} else {\n'
                + '  this.$_goo_1.style.display = \'none\';\n'
                + '}\n'
            )
        })

        it('should add condition for if:_ attribute', () => {
            const render = makeRender({
                '_goo_1': [
                    {
                        type: 'if',
                        prop: '_',
                        value: 'this.color === \'red\''
                    }
                ]
            })
            expect(render).toEqual(''
                + 'if ((this.color === \'red\')) {\n'
                + '  this.$_goo_1.style.display = this.$_goo_1.__goo_display;\n'
                + '} else {\n'
                + '  this.$_goo_1.style.display = \'none\';\n'
                + '}\n'
            )
        })
    })
})