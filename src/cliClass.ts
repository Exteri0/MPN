import * as fs from 'fs'
import * as readline from 'readline'
import Api from './API/api.js'
import ApiCalls from './API/api.js'
import logger from './logger.js'
import { Metrics } from './Metrics/Metrics.js'
import { Correctness } from './Metrics/correctness.js'
import  BusFactor from './Metrics/busFactor.js'
import License from './Metrics/license.js'
import { RampUpTime } from './Metrics/RampUp.js'
import { Responsiveness } from './Metrics/responsiveness.js'

export default class CLI {
    private inputFilePath: string
    private inputURL: string[]
    private cliError: boolean

    constructor(path: string) {
        this.inputFilePath = path
        this.cliError = false
        this.inputURL = []
    }

    public printPath(): void {
        console.log(this.inputFilePath)
    }

    public async startReadingFile(): Promise<void> {
        try {
            const fileStream = fs.createReadStream(this.inputFilePath)
            const rl = readline.createInterface({
                input: fileStream,
                output: undefined,
            })
            for await (const line of rl) {
                let packageURL: string = line.trim()
                if (packageURL != '') {
                    //Get package name here
                    this.inputURL.push(packageURL)
                } else {
                    console.error('This aint the url chief')
                }
            }
            console.log('Loop is done!')
        } catch (error) {
            console.error(`Error ${(error as Error).message}`)
        }
    }

    public async printURLs(): Promise<void> {
        for (const iterator in this.inputURL) {
            console.log(`Current URL = ${this.inputURL[iterator]}`)
        }
    }

    public async getURLList(): Promise<any> {
        return this.inputURL
    }
}




const argument = process.argv.slice(2)

if (argument.length != 1) {
    console.error('Invalid input')
    process.exit(1)
}

let CLIObject = new CLI(argument[0]);
(async () => {
    CLIObject.printPath()
    await CLIObject.startReadingFile()
    await CLIObject.printURLs()
    let urls = await CLIObject.getURLList()
    const API = new ApiCalls(urls)
    const listOfApis = await API.getAPIlist()
    for (let api of listOfApis) {
        console.log(api)
        await api.handleAPI()
    }
})()
