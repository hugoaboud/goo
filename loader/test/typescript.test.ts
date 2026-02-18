import { makeSetup } from "../src/typescript";

describe('typescript', () => {

    describe('setup', () => {
        it('should add child for text attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'text',
                        template: '${this.color}'
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.addGooNode(\'_goo_1\');\n'
                + 'this.$_goo_1._setupText(\'${this.color}\');\n'
            )
        })
        it('should save raw style.display for if:### attribute', () => {
            const html_setup = makeSetup({
                '_goo_1': [
                    {
                        type: 'if',
                        prop: 'color',
                        value: '\'red\''
                    }
                ]
            })
            expect(html_setup).toEqual(''
                + 'this.addGooNode(\'_goo_1\');\n'
                + 'this.$_goo_1._setupIf(\'(this.color === \'red\')\');\n'
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
                + 'this.addGooNode(\'_goo_1\');\n'
                + 'this.$_goo_1._setupSetClass(\'this.open ? \'shine\' : \'\'\');\n'
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
                + 'this.addGooNode(\'_goo_1\');\n'
                + 'this.$_goo_1._setupOn(\'click\', \'this.run()\');\n'
            )
        })
    })

})