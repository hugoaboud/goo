import path from 'path';
import { colored } from './string';

export class Console {

    // Prints a step message to the terminal
    static step(msg: string) {
        console.log(colored('- ' + msg, 'green'));
    }

    // Prints the header
    static header(module: string) {

        const pack = require(path.join(process.cwd(), 'package.json'));

        console.log(colored('  ___   __    __  ', 'green'));
        console.log(colored(' / __) /  \\  /  \\ ', 'green'));
        console.log(colored('( (_ \\(  O )(  O )', 'green'));
        console.log(colored(' \\___/ \\__/  \\__/ ', 'green'));
        console.log(colored('             '+pack?.version, 'lightblue'));
        console.log(colored('\n[ ' + module + ' ]', 'lightpurple'));
        console.log();
    }

}


