import { capitalize } from "../src/helper";

describe('capitalize', () => {
    it('should capitalize single word', () => {
        const capitalized = capitalize('world');
        expect(capitalized).toEqual('World')
    })
    it('should capitalize two-word', () => {
        const capitalized = capitalize('hello-world');
        expect(capitalized).toEqual('HelloWorld')
    })
})