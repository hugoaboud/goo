export { GooWebComponent } from "./src/webc";
export { GooNode } from "./src/node";

import { GooWebComponent } from "./src/webc";

export default class Goo {
  private components: GooWebComponent[] = [];

  private constructor() {}

  public static init(webcomponents: string[]) {
    const goo = new Goo();
    (window as any).goo = goo;
    for (const webc of webcomponents) {
      const element = document.createElement(webc);
      goo.components.push(element as GooWebComponent);
      document.body.appendChild(element);
    }
    goo.render();
  }

  public render() {
    for (const webc of this.components) {
      webc.render();
    }
  }

  /**
   * Creates a dynamic GooWebComponent from name.
   * @param goo_webc_name 
   * @param options 
   * @returns 
   */

  public make(goo_webc_name: string, options?: {
    innerHTML?: string | undefined,
    props?: Record<string, any> | undefined
  }) {
    const webc = document.createElement(goo_webc_name) as GooWebComponent;
    if (options?.innerHTML) {
      webc.setHtml(options.innerHTML);
    }
    this.components.push(webc as GooWebComponent);
    document.body.appendChild(webc);
    if (options?.props) {
      Object.assign(webc, options.props);
    }
    webc.render();
    return webc;
  }

  /**
   * Opens a modal web component and returns a promise which
   * is resolved once it closes.
   * @param goo_webc_name 
   * @param options 
   * @returns 
   */

  public open_modal(goo_webc_name: string, innerHTML?: string) {
        const modal = this.make(goo_webc_name, { innerHTML }) as any;
        return new Promise(resolve => {
            modal.open((response: any) => {
                modal.destroy();
                resolve(response);
            });
        })
    }
}