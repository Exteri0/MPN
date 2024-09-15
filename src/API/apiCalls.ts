import GitHubApiCalls from './GitHubApiCalls'
import NpmApiCalls from './NpmApiCalls'

export default class ApiCalls {
    inputURL: string[]
    callReturnCode: number

    constructor(urls: string[]) {
        this.inputURL = urls
        this.callReturnCode = 0
    }

    async extractInfo(url: string): Promise<{ type: string; owner: string; repo: string }> {
        let splitURL = url.split('/')
        if (splitURL[2] === 'github.com')
            return { type: 'github', owner: splitURL[3], repo: splitURL[4] }
        else if (splitURL[2] === 'www.npmjs.com')
            return { type: 'npm', owner: splitURL[3], repo: splitURL[4] }
        else return { type: 'unknown', owner: '', repo: '' }
    }

    async callAPI(): Promise<number | void> {
        for (let url of this.inputURL) {
            const { type, owner, repo } = await this.extractInfo(url)
            if (type === 'unknown') {
                console.log('Unknown URL')
                this.callReturnCode = 404
                return this.callReturnCode
            }

            if (type === 'github') {
                const githubApi = new GitHubApiCalls([url])
                await githubApi.callAPI()
            } else if (type === 'npm') {
                const npmApi = new NpmApiCalls([url])
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
        return this.callReturnCode !== 200
    }

    generateOutput(): string {
        if (this.checkErrors()) {
            return 'Error occurred during API call'
        } else {
            return 'API call was successful'
        }
    }
}
