import { Octokit } from 'octokit'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
    owner: 'cloudinary',
    repo: 'cloudinary_npm',
    per_page: 2,
})
console.log(response.data)
