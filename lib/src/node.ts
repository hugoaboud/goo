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

  private parent?: GooNode;
  private children: GooNode[] = [];
  private this_as?: string

  // private for_key?: string | undefined;
  private for_parent?: HTMLElement | undefined;
  // private for_pivot?: HTMLElement | undefined;
  
  private slot?: {
    name: string
    source?: GooNode | undefined
    target?: HTMLElement | undefined
  } | undefined

  // private slot_root?: HTMLElement
  // private slot_pivot?: HTMLElement

  private raw = {
    style_display: '',
    class: ''
  };

  constructor(
    private webc: GooWebComponent,
    public id: string,
    public el: HTMLElement & { __goo_is_webc?: boolean, __goo?: GooNode },
  ) {
    if (id !== '_goo_0' && id.startsWith('_goo_')) {
      // NOT_ON_DEBUG
      // el.removeAttribute('id')
    }
    this.el.__goo = this;
  }

  // hierarchy

  public _setChildren(children: GooNode[]) {
    for (const child of children) {
      child.parent = this;
    }
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
    code = 'return ' + code;
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

  public _setupWith(prop: string, code: string) {
    this.raw.class = this.el.className ?? '';
    code = 'return ' + code;
    this.methods[`with:${prop}`] = {
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

  public _setupBindAs(_var: string) {
    this.this_as = _var;
    this._setContext([
      { key: _var, value: this.el }
    ])
  }

  public _setupSlot(name: string) {
    this.slot = {
      name,
      source: undefined
    }
  }

  public _setupSlotInstance(name: string) {
    let parent = this.parent;
    while (parent && !parent.el.__goo_is_webc) {
      parent = parent.parent;
    }
    const nodes = (parent?.el as GooWebComponent).nodes;
    if (!nodes) {
        throw new Error('parent of slot not found');
    }
    for (const node of Object.values(nodes)) {
      if (node.slot?.name === name) {
        node.slot.source = this;
      }
    }
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

  private _addContext(ctx: {
    key: string,
    value: any
  }[]) {
    this.context_keys.push(...ctx.map(c => c.key));
    this.context_vals.push(...ctx.map(c => c.value));
    for (const name in this.methods) {
      this.methods[name]!.fn = new Function(...this.context_keys, this.methods[name]!.code).bind(this.webc) as (...args: any[]) => void
    }
    for (const node of this.children) {
      node._addContext(ctx);
    }
  }

  // render

  public render() {
    let rendered = false;
    if ('#for' in this.methods) {
      this._renderFor();
      rendered = true;
    }
    
    if (!rendered) {
      for (const name in this.methods) {
        const prop = name.split(/^with:/)?.[1];
        if (!prop) continue;
        const value = this.methods[name]!.fn(...this.context_vals);
        this._addContext([
          { key: prop, value }
        ])
      }
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

    if (!rendered && this.slot) {
      this._renderSlot();
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
    let pivot;
    if (!this.for_parent) {
        this.children = [];
        this.for_parent = this.el.parentNode! as any;
        pivot = document.createElement('pivot');
        this.for_parent!.insertBefore(pivot, this.el);
        this.for_parent!.removeChild(this.el);
    }
    else {
      pivot = this.removeClones(this.id);
    }

    const _var = this.methods['#for']?.key!;
    const items = this.methods['#for']?.fn(...this.context_vals);
    for (let i = 0; i < items.length; i++) {
        const clone = this.clone(i.toString());
        this.for_parent!.insertBefore(clone.el, pivot!);
        this.children.push(clone);
        clone._setContext([
          { key: _var as string, value: items[i] }
        ])
    }

    this.for_parent!.removeChild(pivot!);
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

  public _renderSlot() {
    this.children = [];

    const slot = this.slot;
    if (!slot?.source) return false;

    const clone = slot.source.clone('%', this.id) as GooNode;
    clone.el.removeAttribute('slot');
    
    if (slot.source.this_as) {
      clone.this_as = slot.source.this_as;
      const i = clone.context_keys.indexOf(slot.source.this_as);
      clone.context_vals[i] = this.el as any;
    }

    if (slot.target) {
      slot.target.parentNode!.insertBefore(clone.el, slot.target);
      slot.target.remove();
    }
    else {
      this.el.parentNode!.insertBefore(clone.el, this.el);
      this.el.parentNode!.removeChild(this.el);
    }
    slot.target = clone.el;

    this.children.push(clone);
    
    return true;
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

  removeClones(base_id: string) {
    let to_remove = []
    let pivot;
    for (let i = 0; i < this.children.length; i++) {
      const node = this.children[i]!;
      const node_el = node.slot?.target ?? node.el;
      if (node.id.startsWith(base_id+'|')) {
        if (i === this.children.length-1) {
          pivot = document.createElement('pivot');
          node_el.parentNode!.insertBefore(pivot, node_el);
        }
        
        // this.for_parent!.removeChild(node_el);
        node_el.remove();

        to_remove.push(i);
      }
    }
    this.children = this.children.filter((_,i) => !to_remove.includes(i));
    return pivot;
  }

  clone(key: string, id?: string) {
    const _clone = (el: HTMLElement, root: GooNode, parent: GooNode, node?: GooNode) => {
      const clone_el = el.cloneNode() as HTMLElement;
      let clone_node: GooNode | undefined = undefined;

      if (node) {
        clone_node = new GooNode(root.webc, (id ?? node.id) + '|' +key, clone_el);
        clone_node.methods = {...node.methods};
        delete clone_node.methods['#for'];
        clone_node.context_keys = [...node.context_keys];
        clone_node.context_vals = [...node.context_vals];
        clone_node.raw = node.raw;
        clone_node.slot = node.slot ? { ...node.slot } : undefined;

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

      if (clone_node) {
        clone_el.id = clone_node.id;
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        const child_el = el.childNodes[i] as HTMLElement & { __goo?: GooNode };
        const child_clone = _clone(child_el, root, clone_node ?? parent, child_el.__goo);
        clone_el.appendChild(child_clone.el);
        if (child_clone.node) {
          (clone_node ?? parent).children.push(child_clone.node);
        }
      }

      return { el: clone_el, node: clone_node }
    }

    const root = _clone(this.el, this, this, this);
    return root.node!;
  }
}