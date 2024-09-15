import ApiCalls from './ApiCalls'
import { Octokit } from 'octokit'

export default class GitHubApiCalls extends ApiCalls {
    octokit: Octokit

    constructor(urls: string[]) {
        super(urls)
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        })
    }

    async handleGitHubAPI(owner: string, repo: string) {
        console.log(`Making API call to GitHub: ${owner}/${repo}`)
        const response = await this.octokit.request(
            'GET /repos/{owner}/{repo}/issues',
            {
                owner: owner,
                repo: repo,
                per_page: 2,
            }
        )
        console.log(response.data)
    }

    async callAPI(): Promise<number | void> {
        for (let url of this.inputURL) {
            const { type, owner, repo } = await this.extractInfo(url)
            if (type === 'github') {
                await this.handleGitHubAPI(owner, repo)
            }
        }
        return this.callReturnCode
    }
}
