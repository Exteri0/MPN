import { Octokit } from 'octokit'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

await octokit.request('GET /repos/{owner}/{repo}/issues', {
    owner: 'github',
    repo: 'docs',
    per_page: 2,
})
