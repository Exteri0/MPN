import * as fs from 'fs';
import * as readline from 'readline';
import { exec } from 'child_process';
import * as url from 'url';


class CLI{
    private inputFilePath: string;
    private inputURL: string | null;
    private cliError: boolean | null;

    constructor(path: string) {
        this.inputFilePath = path;
        this.cliError = null;
        this.inputURL = null;
    }

    public async printPath(): Promise<void>{
        console.log(this.inputFilePath);
    }

/*     public async findFile(): Promise<void>{
        try {
            const fileStream;
        }
    } */

};

const argument = process.argv.slice(2);

if (argument.length != 1) {
    console.error('Invalid input');
    process.exit(1);
}

let CLIObject = new CLI(argument[0]);
CLIObject.printPath();