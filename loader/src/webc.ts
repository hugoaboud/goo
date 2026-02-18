export const makeWebComponent = (
  name: string,
  tag: string,
  content: string | undefined,
  style: string | undefined,
  is_global_style: boolean,
  class_def: string | undefined,
  goo_link: string | undefined,
  goo_setup: string | undefined
) => ''
+ `import { GooWebComponent } from "@goo/lib";\n`
+ `export class ${name} extends GooWebComponent {\n`
+ `  ${class_def}\n`
+ `  connectedCallback() {\n`
+ `    this.attachShadow({ mode: "open" });\n`
+ (style ? ''
+ `    const style = document.createElement("style");\n`
+ `    style.textContent = '${style}';\n`
: '')
+ ((style && is_global_style) ? ''
+ `    this.appendChild(style);\n`
: '')
+ `    this.shadowRoot.innerHTML = '${content ?? ''}';\n`
+ ((style && !is_global_style) ? ''
+ `    this.shadowRoot.appendChild(style);\n`
: '')
+ `    ${goo_link ?? ''}`
+ `    this.buildNodeTree();\n`
+ `    ${goo_setup ?? ''}`
+ `    this.addGlobalStyle();\n`
+ `    this.setup?.();\n`
+ `  }\n`
+ `}\n`
+ ``
+ `customElements.define('${tag}', ${name});`