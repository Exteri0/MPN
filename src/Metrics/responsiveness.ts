import { all } from 'axios'
import ApiCalls from '../API/api.js'
import GitHubApiCalls from '../API/GitHubApiCalls.js'
import NpmApiCalls from '../API/NpmApiCalls.js'
import { differenceInHours, extractInfo } from '../utils.js'
import { Octokit } from 'octokit'
import 'dotenv/config'
import { extractInfoFromSSH } from '../utils.js'

export class Responsiveness {
    repo: string
    owner: string
    octokit: any
    constructor(owner: string, repo: string) {
        this.owner = owner
        this.repo = repo
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        })
    }
    async ComputerResponsiveness(): Promise<number> {
        let score = 0
        const allIssues = await this.octokit
            .request('GET /repos/{owner}/{repo}/issues', {
                owner: this.owner,
                repo: this.repo,
                per_page: 100,
                state: 'closed',
            })
            .then((response: any) => response.data)
        console.log(`owner is ${this.owner} and repo is ${this.repo}`)
        let counter = 0
        for (const issue of allIssues) {
            if (issue.pull_request == null) counter++
            const issueComments: Array<{ created_at: string }> =
                await this.octokit
                    .request(
                        'GET /repos/{owner}/{repo}/issues/{issue_no}/comments',
                        {
                            owner: this.owner,
                            repo: this.repo,
                            issue_no: issue.number,
                            per_page: 1,
                        }
                    )
                    .then((response: any) => response.data)
            let diffTime: number
            if (issueComments[0]) {
                diffTime = differenceInHours(
                    issue.created_at,
                    issueComments[0].created_at
                )
                diffTime = diffTime / (7 * 24)
                diffTime = Math.min(diffTime, 1)
            } else if (issue.closed_at) {
                if (issue.pull_request != null)
                    diffTime =
                        differenceInHours(issue.created_at, issue.closed_at) /
                        (15 * 24)
                else
                    diffTime =
                        differenceInHours(issue.created_at, issue.closed_at) /
                        (7 * 24)
                diffTime = Math.min(diffTime, 1)
            } else {
                diffTime = 1
            }
            score += diffTime
            console.log(
                `avg response time for issue ${issue.number} is ${diffTime}`
            )
            if (counter > 100) break
        }
        console.log(
            `analyzed ${counter} different issues and ${100 - counter} pull requests`
        )
        return 1 - score / allIssues.length
    }
}

;(async () => {
    const url = 'https://www.npmjs.com/package/browserify'
    const apiInstance = new ApiCalls([url]) // Hardcopy remove it
    const APIObj = await apiInstance.callAPI()
    let score: number
    if (APIObj instanceof GitHubApiCalls) {
        const { type, owner, repo } = await extractInfo(url)
        let ResponsivenessCalculator = new Responsiveness(owner, repo)
        // const response = await APIObj.handleAPI()

        const score = await ResponsivenessCalculator.ComputerResponsiveness()
        console.log(`score for ${repo} is ${score}`)
        console.log('eysyesayeas')
    } else if (APIObj instanceof NpmApiCalls) {
        try {
            const response = await APIObj.handleAPI()
            const { owner, repo } = await extractInfoFromSSH(
                response.repository.url
            )
            let ResponsivenessCalculator = new Responsiveness(owner, repo)
            const score =
                await ResponsivenessCalculator.ComputerResponsiveness()
            console.log(`score for ${repo} is ${score}`)
        } catch (e) {
            console.log(`pkg not found: ${e}`)
        }
    }
})()
