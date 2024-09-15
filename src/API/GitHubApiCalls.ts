import ApiCalls from './apiCalls.js'
import { Octokit } from 'octokit'

export default class GitHubApiCalls extends ApiCalls {
    octokit: Octokit

    constructor(url: string, owner?: string, repo?: string) {
        super(url)
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        })
    }

    async handleAPI() {
        console.log(`Making API call to GitHub: ${this.owner}/${this.repo}`)
        const response = await this.octokit.request(
            'GET /repos/{owner}/{repo}/issues',
            {
                owner: this.owner,
                repo: this.repo,
                per_page: 2,
            }
        )
        console.log(response.data)
    }
}
