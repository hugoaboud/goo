import Goo from ".."


// The application route tree, defined by the app
export type Route = {
    // Base info
    name: string
    path: string

    // follow: when acessing this as a final route,
    // the router will follow into the given child
    follow_to?: string

    // Breadcrumbs / Menu info
    alias?: string
    menu?: {
        alias: string
        icon?: string | undefined
    }[]

    // Associated component + innerHTML for route
    // This component is dynamically added/removed
    // to the nearest parent element (of a given slot)
    elements?: {
        parent_slot: string
        slot: string
        component: string
        innerHTML?: string | undefined
    }[]

    // Tree links
    parent?: Route
    children?: {
        [name: string]: Route
    }
    
    // Metadata (customization)
    meta?: Record<string, any>
}

export class RouteBuilder<
    ParentSlots extends string,
    Slots extends string
> {
    private route: Route
    constructor(
        name: string,
        path: string
    ) {
        this.route = { name, path };
    }

    alias(alias: string) {
        this.route.alias = alias;
        return this;
    }

    menu(menu: (
        factory: (alias: string, icon?: string) => NonNullable<Route['menu']>[number]
    ) => NonNullable<Route['menu']>) {
        const factory = (alias: string, icon?: string) => ({ alias, icon });
        this.route.menu = menu(factory);
        return this;
    }

    slot<Slot extends string>(slot_addr: `${ParentSlots}|${Slot}`, component: string, innerHTML?: string):
        RouteBuilder<ParentSlots, Slots | Slot>
    {
        const [parent_slot, slot] = slot_addr.split('|') as [string, string];
        this.route.elements ??= [];
        this.route.elements.push({
            parent_slot,
            slot,
            component,
            innerHTML
        })
        return this
    }

    child<
        S extends (Slots extends never ? 1 : 0) extends 1 ? ParentSlots : Slots
    >(name: string, def: RouteDef<S, never>) {
        const path = this.route.path === '/'
            ? '/' + name
            : this.route.path + '/' + name;
        const builder = new RouteBuilder(name, path);
        def(builder);
        builder.route.parent = this.route;
        this.route.children ??= {};
        this.route.children[name] = builder.route
        return this
    }

    follow_to(child_name: string) {
        this.route.follow_to = child_name;
        return this;
    }

    meta(meta: Record<string, any>) {
        this.route.meta = meta;
        return this
    }
}

type RouteDef<
    ParentSlots extends string,
    Slots extends string
> = (builder: RouteBuilder<ParentSlots, Slots>) => void

export class GooRouter {

    public root: Route;
    public current: Route;
    
    public branch!: {
        route: Route
        contents: {
            [slot: string]: HTMLElement
        }
    }[];

    public constructor(
        private goo: Goo,
        tree: Route,
    ) {
        this.root = tree;
        this.current = tree;
        window.addEventListener("navigate", (event) => {
            console.log(event);
        })
    }

    public init(contents: Record<string, HTMLElement>) {
        this.branch = [{
            route: this.root,
            contents
        }]
        
        if (window.history.state) {
            this.walk(window.history.state.path);
        }
        else {
            if (this.current.follow_to) {
                this.navTo('/'+this.current.follow_to, { replace: true });
            }
        }

        window.addEventListener("popstate", (e) => {
            if (!e.state) {
                let path = window.location.hash.replace(/#/g, '/');
                if (path.length === 0) path = '/';
                this.navTo(path)
                if (this.current.follow_to) {
                    this.navTo('/' + this.current.follow_to, { replace: true });
                }
                return;
            }
            this.walk(e.state.path);
        });
    }


    /**
     * Make a full navigation to a given url, destroying and
     * creating web components on the way, and adding to the branch.
     */
    public navTo(path: string, options?: {
        replace?: boolean
    }) {
        this.walk(path);
        
        if (options?.replace) {
            window.history.replaceState({
                path
            },"", '#'+this.current.path.replace(/\//g,'-').slice(1));
        }
        else {
            window.history.pushState({
                path
            },"", '#'+this.current.path.replace(/\//g,'-').slice(1));
        }
    }

    /** Walk (shrink then grow branch) */

    private walk(path: string) {
        const names = path.split('/');
        
        // Find starting index (0 is root)
        let i0 = 1;
        for (; i0 < names.length; i0++) {
            const entry = this.branch[i0];
            if (!entry) break;
            if (names[i0] !== entry.route.name) break;
        }

        // Pop n times so it reaches the starting index
        for (let i = i0; i < this.branch.length; i++) {
            this.pop();
        }

        // Push n names so it reaches the desired path
        for (let i = i0; i < names.length; i++) {
            if (names[i]!.length) {
                this.push(names[i]!);
            }
        }

        // Follow
        if (this.current.follow_to) {
            this.push(this.current.follow_to);
        }
    }

    /** Push (grow branch) */

    private push(name: string) {
        // Find child route, or error out
        let route = this.current.children?.[name];
        if (!route) {
            return this.push_error(`Route ${name} is not a valid child of ${this.current.path}`);
        }

        // Make contents of push
        const contents = this.make_push(route);

        // Update router state
        this.current = route;
        this.branch.push({ route, contents })
    }

    /**
     * Make the components required for a push and add them
     * to the DOM tree.
     * 
     * @param route 
     * @param _parent Only used on push_error
     * @returns 
     */
    private make_push(route: Route, _parent?: HTMLElement) {
        const previous = this.branch[this.branch.length-1]!;

        // Route doesn't create elements,
        // so reference the previous elements instead
        // This allows hydrating routes from deeply nested children
        if (!route.elements)
            return previous.contents;

        // Build html elements for the new route
        const contents: Record<string, HTMLElement> = {}
        for (const child of route.elements) {
            const parent = _parent ?? previous.contents?.[child.parent_slot];
            if (!parent) {
                this.push_error(`Slot ${child.parent_slot} not found on parent of route ${route.path}`);
                return previous.contents;
            }
            const content = this.make(child, parent);
            contents[child.slot] = content;
        }
        return contents;
    }

    /** Push (shrink branch) */

    private pop() {
        if (this.branch.length === 1) {
            return this.push_error(`Can't go back from root`);
        }
        const removed = this.branch.pop()!;
        const previous = this.make_pop(removed);

        if (previous) {
            this.current = previous.route;
        }
    }

    /**
     * Make the components required for a pop and add them
     * to the DOM tree.
     */
    private make_pop(removed: GooRouter['branch'][number]) {
        const previous = this.branch[this.branch.length-1]!;
        if (removed.route.elements) {
            for (const child of removed.route.elements) {
                const parent = previous.contents?.[child.parent_slot];
                if (!parent) {
                    return this.push_error(`Broken router state: parent element of slot ${child.slot} not found when popping route ${removed.route.path}`);
                }
                const element = removed.contents[child.slot];
                if (!element) {
                    return this.push_error(`Broken router state: element of slot ${child.slot} not found when popping route ${removed.route.path}`);
                }
                parent.removeChild(element);
            }
        }
        return previous
    }

    /* Error */

    private push_error(error: string) {
        this.walk('/error');
        const contents = this.branch[1]!.contents;
        const content = Object.values(contents)[0]!;
        content.innerHTML = error;
        return undefined;
    }

    /* Make a goo component */

    private make(element: NonNullable<Route['elements']>[number], parent: HTMLElement) {
        const content = this.goo.make(element.component, {
            innerHTML: element.innerHTML
        });
        content.setAttribute('slot', element.slot);
        parent.appendChild(content);
        (content as any).render?.();
        return content;
    }

    /* Tree builder */

    public static tree<
        AppSlot extends string = 'goo-app'
    >(app: AppSlot, def: RouteDef<never, AppSlot>, error_component?: string) {
        const builder = new RouteBuilder('root','/')
            .slot(`|${app}`, app);
        builder.child('error', $ => $
            .slot(`${app}|page`, error_component ?? 'goo-page-error')
        )
        def(builder);
        return (builder as any).route as RouteBuilder<any, any>['route'];
    }

}

// GooRouter.tree($ => $
//     .alias('Home')
//     .menu($ => [$('Home')])
//     .child('buttons', $ => $
//         .alias('Buttons')
//         .menu($ => [$('UI'),$('Buttons')])
//         .slot('|page', 'page-buttons')
//         .child('simple', $ => $
//             // .slot('page|header', 'simple-buttons-header')
//             // .slot('page|body', 'simple-buttons-body')
//             .child('ko', $ => $
//                 .slot('page|gogo', 'oo')
//             )
//         )
//         // .child('complex', $ => $
//         //     .slot('page|header', 'complex-buttons-header')
//         //     .slot('page|body', 'complex-buttons-body')
//         // )
//     )
// )