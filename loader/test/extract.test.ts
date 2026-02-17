import { extractSFC } from "../src/extract"

describe('extract', () => {
    it('should extract <template> tag', () => {
        const extracted = extractSFC(''
            + '<template>'
            + 'Hello World'
            + '</template>'
        );
        expect(extracted.html).toEqual('Hello World');
        expect(extracted.html_options).toBeUndefined();
        expect(extracted.css).toBeUndefined();
        expect(extracted.css_options).toBeUndefined();
        expect(extracted.ts).toBeUndefined();
        expect(extracted.ts_options).toBeUndefined();
    })
    it('should extract <style> tag', () => {
        const extracted = extractSFC(''
            + '<style>'
            + 'Hello World'
            + '</style>'
        );
        expect(extracted.html).toBeUndefined();
        expect(extracted.html_options).toBeUndefined();
        expect(extracted.css).toEqual('Hello World');
        expect(extracted.css_options).toBeUndefined();
        expect(extracted.ts).toBeUndefined();
        expect(extracted.ts_options).toBeUndefined();
    })
    it('should extract <style global> tag', () => {
        const extracted = extractSFC(''
            + '<style global>'
            + 'Hello World'
            + '</style>'
        );
        expect(extracted.html).toBeUndefined();
        expect(extracted.html_options).toBeUndefined();
        expect(extracted.css).toEqual('Hello World');
        expect(extracted.css_options).toEqual('global');
        expect(extracted.ts).toBeUndefined();
        expect(extracted.ts_options).toBeUndefined();
    })
    it('should extract <script> tag', () => {
        const extracted = extractSFC(''
            + '<script>'
            + 'Hello World'
            + '</script>'
        );
        expect(extracted.html).toBeUndefined();
        expect(extracted.html_options).toBeUndefined();
        expect(extracted.css).toBeUndefined();
        expect(extracted.css_options).toBeUndefined();
        expect(extracted.ts).toEqual('Hello World');
        expect(extracted.ts_options).toBeUndefined();
    })
    it('should extract all tags at once', () => {
        const extracted = extractSFC(''
            + '<template>'
            + 'Hello World'
            + '</template>'
            + '<style>'
            + 'Hello World'
            + '</style>'
            + '<script>'
            + 'Hello World'
            + '</script>'
        );
        expect(extracted.html).toEqual('Hello World');
        expect(extracted.html_options).toBeUndefined();
        expect(extracted.css).toEqual('Hello World');
        expect(extracted.css_options).toBeUndefined();
        expect(extracted.ts).toEqual('Hello World');
        expect(extracted.ts_options).toBeUndefined();
    })
})