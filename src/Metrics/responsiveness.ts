import { all } from 'axios'
import ApiCalls from '../API/api.js'
import GitHubApiCalls from '../API/GitHubApiCalls.js'
import NpmApiCalls from '../API/NpmApiCalls.js'
import { differenceInHours, extractInfo } from '../utils.js'
import { Octokit } from 'octokit'
import 'dotenv/config'

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
                per_page: 10,
                state: 'all',
            })
            .then((response: any) => response.data)
        console.log(`owner is ${this.owner} and repo is ${this.repo}`)
        allIssues.forEach(
            async (issue: {
                title: string
                comments_url: string
                created_at: string
                closed_at: string
                number: number
            }) => {
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
                    diffTime =
                        differenceInHours(
                            issue.created_at,
                            issueComments[0].created_at
                        ) / 7
                    diffTime = Math.min(diffTime, 1)
                    // console.log(diffTime)
                } else if (issue.closed_at) {
                    diffTime = 0.5
                } else {
                    diffTime = 1
                }
                score += diffTime
                console.log(diffTime)
            }
        )
        return 1 - score / allIssues.length
    }
}

;(async () => {
    const url = 'https://github.com/cloudinary/cloudinary_npm'
    const apiInstance = new ApiCalls([url]) // Hardcopy remove it
    const { type, owner, repo } = await extractInfo(url)
    const APIObj = await apiInstance.callAPI()
    let ResponsivenessCalculator = new Responsiveness(owner, repo)
    let score: number
    if (APIObj instanceof GitHubApiCalls) {
        const response = await APIObj.handleAPI()

        score = await ResponsivenessCalculator.ComputerResponsiveness()

        console.log(`score for ${repo} is ${score}`)
    } else if (APIObj instanceof NpmApiCalls) {
        const response = await APIObj.handleAPI()

        score = await ResponsivenessCalculator.ComputerResponsiveness()

        console.log(score)
    }
})()
