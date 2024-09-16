import isLicenseCompatible from '../Metrics/license.js'
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
        const reponse = await this.octokit
            .request('GET /repos/{owner}/{repo}', {
                owner: this.owner,
                repo: this.repo,
            })
            .then((response: any) => response.data)

        const licenseNo = isLicenseCompatible(reponse.license) ? 1 : 0
        console.log({
            name: reponse.name,
            license: licenseNo,
        })
    }
}
