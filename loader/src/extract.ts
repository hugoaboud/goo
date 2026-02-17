export function extractSFC(source: string) {
    const html = source.match(/<template(.*?)>(.*)<\/template>/s) ?? undefined;
    const css = source.match(/<style(.*?)>(.*)<\/style>/s) ?? undefined;
    const ts = source.match(/<script(.*?)>(.*)<\/script>/s) ?? undefined;

    return {
        html: html?.[2]?.length ? html[2].trim() : undefined,
        html_options: html?.[1]?.length ? html[1].trim() : undefined,
        css: css?.[2]?.length ? css[2].trim() : undefined,
        css_options: css?.[1]?.length ? css[1].trim() : undefined,
        ts: ts?.[2]?.length ? ts[2].trim() : undefined,
        ts_options: ts?.[1]?.length ? ts[1].trim() : undefined,
    };
}