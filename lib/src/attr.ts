export type GooAttribute =
{
    type: 'void'
} | {
    type: 'text'
    pos: number
    template: string
} | {
    type: 'if'
    prop: string
    value: string | undefined
} | {
    type: 'set'
    prop: string
    code: string
} | {
    type: 'on'
    event: string
    code: string
} | {
    type: 'for'
    var: string
    iterator: string
} | {
    type: 'this'
    var: string
}