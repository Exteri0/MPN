import { Octokit } from 'octokit'

class ApiCalls {
    inputURL: string[]
    callReturnCode: number
    octokit: Octokit

    constructor(urls: string[]) {
        this.inputURL = urls
        this.callReturnCode = 0

        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        })
    }

    async extractInfo(
        url: string
    ): Promise<{ type: string; owner: string; repo: string }> {
        let splitURL = url.split('/')
        if (splitURL[2] == 'github.com')
            return { type: 'github', owner: splitURL[3], repo: splitURL[4] }
        else if (splitURL[2] == 'www.npmjs.com')
            return { type: 'npm', owner: splitURL[3], repo: splitURL[4] }
        else return { type: 'unknown', owner: '', repo: '' }
    }

    async callAPI(): Promise<number | void> {
        for (let url of this.inputURL) {
            const { type, owner, repo } = await this.extractInfo(url)
            if (type == 'unkown') {
                console.log('Unknown URL')
                return (this.callReturnCode = 404)
            } else if (type == 'github') {
                console.log(`Making API call to: ${url}`)
                const response = await this.octokit.request(
                    'GET /repos/{owner}/{repo}/issues',
                    {
                        owner: owner,
                        repo: repo,
                        per_page: 2,
                    }
                )
                console.log(response.data)
            } else {
                const res = await fetch(`https://registry.npmjs.org/${repo}`)
                const data = await res.json()
                console.log(data.description)
            }
        }
        return (this.callReturnCode = 200)
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

export default ApiCalls
