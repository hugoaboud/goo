export type $GooFormSection = {
    $item: 'section'
    name: string
    alias: string
}

export type $GooFormRow = {
    $item: 'row'
}

export type $GooFormField = {
    $item: 'field'
    name: string
    alias: string
    type: 'string'|'int'|'float'|'bool'
}

export type $GooFormItem = $GooFormSection | $GooFormRow | $GooFormField

export type $GooForm = {
    items: $GooFormItem[]
}