import ApiCalls from './apiCalls.js'
import isLicenseCompatible from '../Metrics/license.js'
import 'dotenv/config'
//import ApiCalls from './apiCalls.js'
import { Octokit } from 'octokit'


export default class GitHubApiCalls extends ApiCalls {
    octokit: Octokit

    constructor(url: string, owner?: string, repo?: string) {
        super(url, owner, repo)
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
        })
    }

    /* async handleGitHubAPI(owner: string, repo: string) {
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
    } */
// added this function
    async fetchContributors(owner: string, repo: string): Promise<any[]> {
        try {
            const response = await this.octokit.request(
                'GET /repos/{owner}/{repo}/contributors',
                {
                    owner: owner,
                    repo: repo,
                    per_page: 100 
                }
            );

            // Return an array of contributors and their contributions
            return response.data.map((contributor: any) => ({
                login: contributor.login,
                contributions: contributor.contributions
            }));
        } catch (error) {
            console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
            return [];
        }
    }
    async handleAPI() {
        console.log(`Making API call to GitHub: ${this.owner}/${this.repo}`)
        const response = await this.octokit
            .request('GET /repos/{owner}/{repo}', {
                owner: this.owner,
                repo: this.repo,
            })
            .then((response: any) => response.data)
        return response;

       /*  const licenseNo = isLicenseCompatible(reponse.license) ? 1 : 0
        console.log({
            name: reponse.name,
            license: licenseNo,
        }) */
    }

}
