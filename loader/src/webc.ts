export const makeWebComponent = (
  name: string,
  tag: string,
  content: string | undefined,
  style: string | undefined,
  is_global_style: boolean,
  goo_setup: string | undefined,
  script_setup: string | undefined,
  render: string | undefined
) => ''
+ `import { addGlobalStyle } from "@goo/lib";\n`
+ `export class ${name} extends HTMLElement {\n`
+ `  connectedCallback() {\n`
+ `    const shadowRoot = this.attachShadow({ mode: "open" });\n`
+ (style ? ''
+ `    const style = document.createElement("style");\n`
+ `    style.textContent = '${style}';\n`
: '')
+ ((style && is_global_style) ? ''
+ `    this.appendChild(style);\n`
: '')
+ `    shadowRoot.innerHTML = '${content ?? ''}';\n`
+ ((style && !is_global_style) ? ''
+ `    shadowRoot.appendChild(style);\n`
: '')
+ `    ${goo_setup ?? ''}`
+ `    {${script_setup ?? ''}}\n`
+ `    addGlobalStyle(shadowRoot);\n`
+ `    this.render()\n`
+ `  }\n`
+ `  render() {\n`
+ `    ${render ?? ''}`
+ `  }\n`
+ `}\n`
+ ``
+ `customElements.define('${tag}', ${name});`