import { parseHtml } from "./html";
import { GooNode } from "./node";
import { setup } from "./setup";

export abstract class GooWebComponent extends HTMLElement {
  
  public __goo_is_webc = true;

  public shadowRoot!: ShadowRoot;
  public nodes: {
    [id: string]: GooNode
  } = {};

  private layer: GooNode[] = [];

  public setHtml(innerHTML: string) {
    const root = document.createElement('goo');
    root.innerHTML = innerHTML;
    const attributes = parseHtml(root);
    this.append(...(root.childNodes as any));
    setup(this, attributes);
    root.remove();
  }

  /* Global Styles */

  private getGlobalStyleSheets() {
    return Array.from(document.styleSheets)
      .map(x => {
        const sheet = new CSSStyleSheet();
        const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
        sheet.replaceSync(css);
        return sheet;
      });
  }

  protected addGlobalStyle() {
    this.shadowRoot.adoptedStyleSheets.push(
      ...this.getGlobalStyleSheets()
    );
  }

  /* Children */

  protected addGooNode(id: string, from: HTMLElement = this.shadowRoot as any) {
    const el = (id === '_goo_0'
      ? from
      : from.querySelector(`#${id}`)) as HTMLElement & { __goo_is_webc?: boolean };
    const node = new GooNode(this, id, el); 
    this.nodes[id] = node;
    if (!id.startsWith('_goo_')) {
      (this as any)[`$${id}`] = this.nodes[id].el; 
    }
  }

  protected buildNodeTree(root: HTMLElement = this.shadowRoot as any) {
    // Find webcomponents that are children of this,
    // but haven't been assigned any goo attributes.
    // This is required to properly render children webcomponents.
    let c = 0;
    const walk = (el: HTMLElement & { __goo_is_webc?: boolean, __goo?: GooNode }, root = true) => {
      if (el.__goo_is_webc && !el.__goo) {
        const id = el.getAttribute('id') ?? `_goo_webc_${c++}`;
        const node = new GooNode(this, id, el); 
        this.nodes[id] = node;
        if (!id.startsWith('_goo_')) {
          (this as any)[`$${id}`] = this.nodes[id].el;
        }
      }
      if (el.__goo && root) {
        this.layer.push(el.__goo);
        root = false;
      }
      for (let i = 0; i < el.childNodes.length; i++) {
        walk(el.childNodes[i] as any, root);
      }
    }
    walk(root as any);

    for (const node of this.layer) {
      node._buildTree();
    }
  }

  public render() {
    // Attributes must be stored as properties during render,
    // so the WebComponent can access it through `this.propName`;
    for (const attr of Array.from(this.attributes)) {
      (this as any)[attr.name] = attr.value;
    }
    for (const node of this.layer) {
      node.render();
    }
  }

  public destroy() {
    this.parentElement!.removeChild(this);
  }
}