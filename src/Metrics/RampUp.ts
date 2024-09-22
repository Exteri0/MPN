import GitHubApiCalls from '../API/GitHubApiCalls.js'
import NpmApiCalls from '../API/NpmApiCalls.js'
import ApiCalls from '../API/api.js'

export default class RampUpTime {
    static calculateRampUpTimeGithub(data: any): number {
        const {
            stargazers_count,
            forks_count,
            open_issues_count,
            watchers_count,
            has_wiki,
            has_pages,
            has_discussions,
        } = data

        // Used log normalization as the distribution of the values is extreme therefore any other normalization will not be accurate for numbers
        // that are small but good.
        const normalizedStargazers =
            Math.log(stargazers_count + 1) / Math.log(10000 + 1)
        const normalizedForks = Math.log(forks_count + 1) / Math.log(10000 + 1)
        const normalizedOpenIssues =
            1 - Math.log(open_issues_count + 1) / Math.log(1000 + 1) // The more the issues the worse the ramp-up.
        const normalizedWatchers =
            Math.log(watchers_count + 1) / Math.log(3000 + 1)

        const wikiScore = has_wiki ? 1 : 0
        const pagesScore = has_pages ? 1 : 0
        const discussionsScore = has_discussions ? 1 : 0

        const weightStargazers = 0.15
        const weightForks = 0.15
        const weightOpenIssues = 0.15
        const weightWatchers = 0.05
        const weightWiki = 0.25
        const weightPages = 0.15
        const weightDiscussions = 0.1

        const rampUpScore =
            normalizedStargazers * weightStargazers +
            normalizedForks * weightForks +
            normalizedOpenIssues * weightOpenIssues +
            normalizedWatchers * weightWatchers +
            wikiScore * weightWiki +
            pagesScore * weightPages +
            discussionsScore * weightDiscussions

        return rampUpScore
    }

    static async calculateRampUpTimeNPM(data: any): Promise<number> {
        const {
            readme,
            Versions,
            Maintainers,
            Dependencies,
            repository,
            githubrepository,
        } = data

        const normalizedVersions = Math.log(Versions + 1) / Math.log(50 + 1)

        const normalizedMaintainers =
            Math.log(Maintainers + 1) / Math.log(10 + 1)

        const normalizedDependencies =
            1 - Math.log(Dependencies + 1) / Math.log(20 + 1)

        const weightReadme = 0.25
        const weightVersions = 0.2
        const weightMaintainers = 0.15
        const weightDependencies = 0.25
        const weightGithubRepository = 0.15

        const rampUpScore =
            readme * weightReadme +
            normalizedVersions * weightVersions +
            normalizedMaintainers * weightMaintainers +
            normalizedDependencies * weightDependencies +
            githubrepository * weightGithubRepository

        return rampUpScore
    }
}

;(async () => {
    const apiInstance = new ApiCalls(['https://github.com/nullivex/nodist']) // Hardcopy remove it
    const APIObj = await apiInstance.callAPI()
    let RampUpCalculator: RampUpTime
    let score: number
    if (APIObj instanceof GitHubApiCalls) {
        const response = await APIObj.handleAPI()

        score = await RampUpTime.calculateRampUpTimeGithub({
            stargazers_count: response.stargazers_count,
            forks_count: response.forks_count,
            open_issues_count: response.open_issues_count,
            watchers_count: response.watchers_count,
            has_wiki: response.has_wiki,
            has_pages: response.has_pages,
        })

        console.log(score)
    } else if (APIObj instanceof NpmApiCalls) {
        const response = await APIObj.handleAPI()

        score = await RampUpTime.calculateRampUpTimeNPM({
            readme: response.readme ? 1 : 0,
            Versions: Object.keys(response.versions).length,
            Maintainers: response.maintainers.length,
            Dependencies: Object.keys(response.dependencies).length,
            repository: response.repository,
            githubrepository: response.repository.url.includes('github')
                ? 1
                : 0,
        })

        console.log(score)
    }
})()
