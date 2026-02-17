import loader from "..";

describe('loader', () => {

    it('should parse valid goo file', () => {
        const source = loader.bind({
            resourcePath: 'test.goo'
        })(''
            + '<template>'
            + ' Hello World!'
            + '</template>'
        );
        expect(source).toEqual(''
            + 'import { addGlobalStyle } from "@goo/lib";\n'
            + 'export class Test extends HTMLElement {\n'
            + '  connectedCallback() {\n'
            + '    const shadowRoot = this.attachShadow({ mode: "open" });\n'
            + '    shadowRoot.innerHTML = \'Hello World!\';\n'
            + '    \n'
            + '    {}\n'
            + '    addGlobalStyle(shadowRoot);\n'
            + '    this.render()\n'
            + '  }\n'
            + '  render() {\n'
            + '    \n'
            + '  }\n'
            + '}\n'
            + 'customElements.define(\'test\', Test);'
        )
    })

})