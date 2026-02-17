
import * as fs from 'fs';
import * as path from 'path';
import { Console } from './util/console';
import { Shell } from './util/shell';

Console.header('Bundle Lib')

async function main() {
    
    Console.step('(Step 1) Clean build folder')
    fs.rmSync('build', { recursive: true, force: true });

    Console.step('(Step 2) Transpile TypeScript source files')
    await Shell.cmd('.', 'npm run build')

    Console.step('(Step 3) Copy "package.json" file to build/');
    {
        const source = path.resolve('.', 'package.json');
        const target = path.resolve('.', 'build', 'package.json');
        fs.cpSync(source, target, { recursive: true });
    }

    Console.step('(Step 4) Copy "README.md" file to build/');
    {
        const source = path.resolve('.', 'README.md');
        const target = path.resolve('.', 'build', 'README.md');
        fs.cpSync(source, target, { recursive: true });
    }
    
}

main();