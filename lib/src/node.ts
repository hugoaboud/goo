import { GooWebComponent } from "./webc";

export class GooNode {
  private methods: {
    [name: string]: {
      key?: string|number
      code: string,
      fn: (...args: any[]) => any
    }
  } = {};

  private context_keys: string[] = [];
  private context_vals: string[] = [];

  private children: GooNode[] = [];

  private for_key?: string | undefined;
  private for_parent?: HTMLElement | undefined;
  private for_pivot?: HTMLElement | undefined;

  private raw = {
    style_display: '',
    class: ''
  };

  constructor(
    private webc: GooWebComponent,
    public id: string,
    public el: HTMLElement & { __goo_is_webc?: boolean, __goo?: GooNode },
    for_key?: string
  ) {
    if (id !== '_goo_0' && id.startsWith('_goo_')) {
      el.removeAttribute('id')
    }
    this.el.__goo = this;
    this.for_key = for_key;
  }

  // hierarchy

  public _setChildren(children: GooNode[]) {
    this.children = children;
  }
  
  // setup

  public _setupText(pos: number, code: string) {
    code = 'return `'+code+'`';
    this.methods[`text:${pos}`] = {
      key: pos,
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
  }

  public _setupIf(code: string) {
    this.raw.style_display = this.el.style.display;
    this.methods['#if'] = {
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
  }

  public _setupSet(prop: string, code: string) {
    this.raw.class = this.el.className ?? '';
    code = 'return ' + code;
    this.methods[`set:${prop}`] = {
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
  }

  public _setupSetClass(code: string) {
    this.raw.class = this.el.className ?? '';
    code = 'return ' + code;
    this.methods['#class'] = {
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
  }

  public _setupFor(_var: string, iterator: string) {
    const code = `const _a = []; for (const it ${iterator}) { _a.push(it); } return _a;`;
    this.methods['#for'] = {
      key: _var,
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
  }

  public _setupThisAs(_var: string) {
    this._setContext([
      { key: _var, value: this.el }
    ])
  }

  public _setupOn(event: string, code: string) {
    code = `return (${code})`;
    this.methods['on:'+event] = {
      key: event,
      code,
      fn: new Function('', code).bind(this.webc) as (...args: any[]) => void
    }
    const fn = (ev: Event & { detail?: any }) => {
      const res = this.methods['on:'+event]!.fn(...this.context_vals);
      if (typeof res === 'function') return res.bind(this.webc)(ev.detail);
      return res;
    }
    this.el.addEventListener(event, fn);
  }

  // context

  private _setContext(ctx: {
    key: string,
    value: any
  }[]) {
    this.context_keys = ctx.map(c => c.key);
    this.context_vals = ctx.map(c => c.value);
    for (const name in this.methods) {
      this.methods[name]!.fn = new Function(...this.context_keys, this.methods[name]!.code).bind(this.webc) as (...args: any[]) => void
    }
    for (const node of this.children) {
      node._setContext(ctx);
    }
  }

  // render

  public render() {
    if ('#for' in this.methods) {
      this._renderFor();
    }
    else {
      for (const name in this.methods) {
        if (!name.startsWith('text:')) continue;
        this._renderText(name);
      }
      if ('#if' in this.methods) {
        this._renderIf();
      }
      if ('#class' in this.methods) {
        this._renderClass();
      }
      for (const name in this.methods) {
        const prop = name.split(/^set:/)?.[1];
        if (!prop) continue;
        (this.el as any)[prop] = this.methods[name]!.fn(...this.context_vals);
        (this.el as GooWebComponent).render?.();
      }
    }
    for (const node of this.children) {
      node.render();
    }
    // After rendering the node properties, if it's a goo
    // webcomponent, we must render it as well
    if (this.el.__goo_is_webc) {
      (this.el as GooWebComponent).render();
    }
  }

  protected _renderFor() {
    if (!this.for_parent) {
        this.for_parent = this.el.parentElement ?? undefined;
        this.for_pivot = (this.el.nextSibling as HTMLElement) ?? undefined;
        this.for_parent?.removeChild(this.el);
    }
    else {
        this.removeClones();
    }

    const _var = this.methods['#for']?.key!;
    const items = this.methods['#for']?.fn(...this.context_vals);
    for (let i = 0; i < items.length; i++) {
        const clone = this.clone(i.toString());
        this.for_parent!.insertBefore(clone.el, this.for_pivot!);
        this.children.push(clone);
        clone._setContext([
          { key: _var as string, value: items[i] }
        ])
    }
  }

  protected _renderText(name: string) {
    const pos = this.methods[name]!.key! as number;
    const target = this.el.childNodes[pos]! as any as { data: string };
    target.data = this.methods[name]!.fn(...this.context_vals);
  }

  protected _renderIf() {
    const display = this.methods['#if']?.fn(...this.context_vals);
    this.el.style.display = display
      ? this.raw.style_display
      : 'none';
  }

  protected _renderClass() {
    const _class = this.methods['#class']?.fn(...this.context_vals);
    this.el.className = this.raw.class + ' ' + _class;
  }

  public _buildTree() {
    const child_nodes: GooNode[] = [];
    const walk = (el: HTMLElement) => {
      for (let i = 0; i < el.childNodes.length; i++) {
        const child_el = el.childNodes[i]!;
        if ('__goo' in child_el) {
          child_nodes.push(child_el.__goo as GooNode);
          continue;
        }
        walk(child_el as HTMLElement);
      }
    }
    walk(this.el);
    this._setChildren(child_nodes);
    for (const child_node of child_nodes) {
      child_node._buildTree();
    }
  }

  /* Cloning */

  removeClones() {
    let to_remove = []
    for (let i = 0; i < this.children.length; i++) {
      const node = this.children[i]!;
      if (node.for_key !== undefined) {
        this.for_parent!.removeChild(node.el);
        to_remove.push(i);
      }
    }
    this.children = this.children.filter((_,i) => !to_remove.includes(i));
  }

  clone(key: string) {
    const _clone = (el: HTMLElement, root: GooNode, node?: GooNode) => {
      const clone_el = el.cloneNode() as HTMLElement;
      let clone_node: GooNode | undefined = undefined;
      if (node) {
        clone_node = new GooNode(node.webc, node.id, clone_el, key);
        clone_node.methods = node.methods;
        delete clone_node.methods['#for'];
        clone_node.context_keys = node.context_keys;
        clone_node.context_vals = node.context_vals;
        clone_node.raw = node.raw;

        for (const name in clone_node.methods) {
          if (!name.startsWith('on:')) continue;
          const fn = (ev: Event & { detail?: any }) => {
            const res = clone_node!.methods[name]!.fn(...clone_node!.context_vals);
            if (typeof res === 'function') return res.bind(clone_node!.webc)(ev.detail);
            return res;
          }
          clone_node.el.addEventListener(clone_node.methods[name]!.key as string, fn);
        }
        
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        const child_el = el.childNodes[i] as HTMLElement & { __goo?: GooNode };
        const child_clone = _clone(child_el, root, child_el.__goo);
        clone_el.appendChild(child_clone.el);
        if (child_clone.node) {
          (clone_node ?? root).children.push(child_clone.node);
        }
      }

      return { el: clone_el, node: clone_node }
    }

    const root = _clone(this.el, this, this);
    return root.node!;
  }
}