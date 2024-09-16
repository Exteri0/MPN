import RampUpTime from '../Metrics/RampUp.js';
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

        const response = await this.octokit
            .request('GET /repos/{owner}/{repo}', {
                owner: this.owner,
                repo: this.repo,
            })
            .then((response: any) => response.data)

            const rampUpData = RampUpTime.calculateRampUpTime({
                stargazers_count: response.stargazers_count,
                forks_count: response.forks_count,
                open_issues_count: response.open_issues_count,
                watchers_count: response.watchers_count,
                has_wiki: response.has_wiki,
                has_pages: response.has_pages,
                has_discussions: response.has_discussions
            })
            
            console.log({
                name: response.name,
                stargazers_count: response.stargazers_count,
                forks_count: response.forks_count,
                open_issues_count: response.open_issues_count,
                watchers_count: response.watchers_count,
                has_wiki: response.has_wiki,
                has_pages: response.has_pages,
                has_discussions: response.has_discussions,
                rampUpScore: rampUpData,
            })
    }
}
