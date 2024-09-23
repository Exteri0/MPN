import * as fs from 'fs'
import * as readline from 'readline'
import ApiCalls from './API/api.js'
import logger from './logger.js'
import { Correctness } from './Metrics/correctness.js'
import BusFactor from './Metrics/busFactor.js'
import License from './Metrics/license.js'
import { RampUpTime } from './Metrics/RampUp.js'
import { Responsiveness } from './Metrics/responsiveness.js'
import { measureExecutionTime } from './utils.js'

interface MetricResult {
    URL: string
    NetScore: number
    NetScore_Latency: number
    RampUp: number
    RampUp_Latency: number
    Correctness: number
    Correctness_Latency: number
    BusFactor: number
    BusFactor_Latency: number
    ResponsiveMaintainer: number
    ResponsiveMaintainer_Latency: number
    License: number
    License_Latency: number
}

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
        logger.info(this.inputFilePath)
    }

    public printURLs(): void {
        for (const url of this.inputURL) {
            logger.info(`Current URL = ${url}`)
        }
    }

    public async startReadingFile(): Promise<void> {
        try {
            const fileStream = fs.createReadStream(this.inputFilePath)
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            })
            for await (const line of rl) {
                const packageURL: string = line.trim()
                if (packageURL !== '') {
                    this.inputURL.push(packageURL)
                } else {
                    logger.warn('Empty line encountered in the input file.')
                }
            }
        } catch (error) {
            logger.error(
                `Error reading input file: ${(error as Error).message}`
            )
        }
    }

    public getURLList(): string[] {
        return this.inputURL
    }
}

;(async () => {
    const argument = process.argv.slice(2)

    if (argument.length !== 1) {
        console.error('Invalid input. Usage: ./run <absloute path>')
        //process.exit(1)
    }

    const cliObject = new CLI(argument[0])
    await cliObject.startReadingFile()
    const urls = cliObject.getURLList()

    const apiCallsInstance = new ApiCalls(urls)
    const listOfApis = await apiCallsInstance.getAPIlist()

    const results: MetricResult[] = []

    for (const api of listOfApis) {
        try {
            // Instantiate metric calculators
            const correctnessCalculator = new Correctness(api)
            const busFactorCalculator = new BusFactor(api)
            const rampUpCalculator = new RampUpTime(api)
            const responsivenessCalculator = new Responsiveness(api)
            //const licenseCalculator = new License(api);
            const licenseCalculator = new License(api)
            // Measure execution time of each metric calculation
            const [
                resCorrectness,
                resBusFactor,
                resRampUp,
                resResponsiveness,
                resLicense,
            ] = await Promise.all([
                measureExecutionTime(() =>
                    correctnessCalculator.computeCorrectness()
                ),
                measureExecutionTime(() =>
                    busFactorCalculator.calcBusFactor(api.owner, api.repo)
                ),
                measureExecutionTime(() =>
                    rampUpCalculator.computeRampUpTime()
                ),
                measureExecutionTime(() =>
                    responsivenessCalculator.ComputeResponsiveness()
                ),
                measureExecutionTime(() => licenseCalculator.checkLicenseAPI()),
            ])

            // Get scores and times
            const CorrectnessScore = resCorrectness.result || 0
            const BusFactorScore = resBusFactor.result || 0
            const RampUpScore = resRampUp.result || 0
            const ResponsivenessScore = resResponsiveness.result || 0
            const LicenseScore = resLicense.result

            const CorrectnessTime = resCorrectness.time || 0
            const BusFactorTime = resBusFactor.time || 0
            const RampUpTimeVal = resRampUp.time || 0
            const ResponsivenessTime = resResponsiveness.time || 0
            const LicenseTime = resLicense.time || 0
            let NetScore: number
            // Calculate NetScore
            if (LicenseScore == false) {
                NetScore = 0
            }
            else {
                NetScore = ((CorrectnessScore +
                            BusFactorScore +
                            RampUpScore +
                            ResponsivenessScore) / 4)
            }

            const NetScore_Latency = parseFloat(
                (
                    CorrectnessTime +
                    BusFactorTime +
                    RampUpTimeVal +
                    ResponsivenessTime +
                    LicenseTime
                ).toFixed(3)
            )

            // Collect results
            const result: MetricResult = {
                URL: api.url,
                NetScore: parseFloat(NetScore.toFixed(2)),
                NetScore_Latency: NetScore_Latency,
                RampUp: parseFloat(RampUpScore.toFixed(2)),
                RampUp_Latency: parseFloat(RampUpTimeVal.toFixed(3)),
                Correctness: parseFloat(CorrectnessScore.toFixed(2)),
                Correctness_Latency: parseFloat(CorrectnessTime.toFixed(3)),
                BusFactor: parseFloat(BusFactorScore.toFixed(2)),
                BusFactor_Latency: parseFloat(BusFactorTime.toFixed(3)),
                ResponsiveMaintainer: parseFloat(
                    ResponsivenessScore.toFixed(2)
                ),
                ResponsiveMaintainer_Latency: parseFloat(
                    ResponsivenessTime.toFixed(3)
                ),
                License: parseFloat(LicenseScore == false ? "0" : "1"),
                License_Latency: parseFloat(LicenseTime.toFixed(3)),
            }

            results.push(result)
        } catch (error) {
            logger.error(`Error processing API ${api.url}:`, error)
        }
    }

    // Sort results by NetScore in descending order
    results.sort((a, b) => b.NetScore - a.NetScore)

    // Output results
    for (const result of results) {
        console.log(JSON.stringify(result))
    }
    //process.exit(0)
})()
