export { GooWebComponent } from "./src/webc";
export { GooNode } from "./src/node";

import { GooRouter, Route } from "./src/router";
import { GooWebComponent } from "./src/webc";

export default class Goo {

  private components: GooWebComponent[] = [];

  public router: GooRouter;

  private constructor(
    route_tree: Route
  ) {
    this.router = new GooRouter(this, route_tree)
  }

  public static init(
    webcomponents: string[],
    route_tree: Route = {
      name: 'root',
      path: '',
      children: {
        'error': {
          name: 'error',
          path: '/error'
        }
      }
    }
  ) {
    const goo = new Goo(route_tree);
    (window as any).goo = goo;

    const contents: Record<string, HTMLElement> = {};
    for (const webc of webcomponents) {
      const element = document.createElement(webc);
      goo.components.push(element as GooWebComponent);
      document.body.appendChild(element);
      contents[webc] = element;
    }
    // The router currently uses the last webc as root, this might change
    goo.router.init(contents);
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
    append?: boolean
  }) {
    const webc = document.createElement(goo_webc_name);
    if (webc instanceof GooWebComponent) {
      if (options?.innerHTML) {
        webc.setHtml?.(options.innerHTML);
      }
      this.components.push(webc as GooWebComponent);
      if (options?.props) {
        Object.assign(webc, options.props);
      }
    }
    else {
      if (options?.innerHTML) {
        webc.innerHTML = options.innerHTML;
        Object.assign(webc, options.props);
      }
    }
    if (options?.append) {
      document.body.appendChild(webc);
    }
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
        document.body.appendChild(modal);
        return new Promise(resolve => {
            modal.open((response: any) => {
                modal.destroy();
                resolve(response);
            });
        })
    }
}