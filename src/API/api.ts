import GitHubApiCalls from './GitHubApiCalls.js'
import NpmApiCalls from './NpmApiCalls.js'
import { extractInfo } from './utils.js'

export default class ApiCalls {
    inputURL: string[]
    callReturnCode: number

    constructor(urls?: string[]) {
        this.inputURL = urls ?? []
        this.callReturnCode = 0
    }

    async callAPI(): Promise<number | void> {
        if (!this.checkErrors()) {
            console.log('No URL provided')
            return
        }
        for (let url of this.inputURL) {
            const { type, owner, repo } = await extractInfo(url)
            if (type === 'unknown') {
                console.log('Unknown URL')
                this.callReturnCode = 404
                return this.callReturnCode
            }

            if (type === 'github') {
                const githubApi = new GitHubApiCalls(url, owner, repo)
                await githubApi.callAPI()
            } else if (type === 'npm') {
                const npmApi = new NpmApiCalls(url, owner, repo)
                await npmApi.callAPI()
            }
        }

        this.callReturnCode = 200
        return this.callReturnCode
    }

    getURL(): string[] {
        return this.inputURL
    }

    checkErrors(): boolean {
        return this.getURL().length !== 0
    }

    setURL(urls: string[]): void {
        this.inputURL = urls
    }

    generateOutput(): string {
        if (this.checkErrors()) {
            return 'Error occurred during API call'
        } else {
            return 'API call was successful'
        }
    }
}
