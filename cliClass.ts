import * as fs from 'fs';
import * as readline from 'readline';
import { exec } from 'child_process';
import * as url from 'url';
import { stdout } from 'process';


export class CLI{
    private inputFilePath: string;
    private inputURL: string[] 
    private cliError: boolean

    constructor(path: string) {
        this.inputFilePath = path;
        this.cliError = false;
        this.inputURL = [];
    }

    public printPath(): void{
        console.log(this.inputFilePath);
    }

    public async startReadingFile(): Promise<void>{
        try {
            const fileStream = fs.createReadStream(this.inputFilePath);
            const rl = readline.createInterface({
                input: fileStream,
                output: undefined
            });
            for await (const line of rl) {
                let packageURL: string = line.trim();
                if (packageURL != '') {
                    //Get package name here
                    this.inputURL.push(packageURL);
                }
                else {
                    console.error("This aint the url chief");

                }
            }
            console.log("Loop is done!");
        }
        catch (error) {
            console.error(`Error ${(error as Error).message}`);
        }

    }

    public async printURLs(): Promise<void> {
        for (const iterator in this.inputURL) {
            console.log(`Current URL = ${this.inputURL[iterator]}`);
        }
    }

    public async getURLList(): Promise<any>{
        return this.inputURL;
    }

};
// AM added this so it only runs when the file is executed directly from the command line
if(require.main === module) {

    const argument = process.argv.slice(2);

    if (argument.length != 1) {
        console.error('Invalid input');
        process.exit(1);
    }


let CLIObject = new CLI(argument[0]);
(async () => {
    await CLIObject.printPath();
    await CLIObject.startReadingFile();
    await CLIObject.printURLs();
    let i: string;
    for (i of await CLIObject.getURLList()) {
        console.log(`Returned: ${i}`)
    }
})();
}
