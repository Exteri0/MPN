import GitHubApiCalls from '../API/GitHubApiCalls.js'
import NpmApiCalls from '../API/NpmApiCalls.js'
import ApiCalls from '../API/api.js'

export class RampUpTime {
    private apiCall: GitHubApiCalls | NpmApiCalls

    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        this.apiCall = apiCall
    }

    public async computeRampUpTime(): Promise<number> {
        const response = await this.apiCall.handleAPI()

        if (!response) return -1

        let rampUpScore = 0

        // The approach taken to calculate rampscore is a datascience based approach where the variables are normalized using log normalization
        // then multiplied by the weight of each variable respectively to get the final score

        if (this.apiCall instanceof GitHubApiCalls) {
            // We use nullish coalescing to check if certain variables might return undefined or null
            const normalizedStargazers = await this.normalizeLog(
                response.stargazers_count,
                10000
            )
            const normalizedForks = await this.normalizeLog(
                response.forks_count,
                10000
            )
            const normalizedOpenIssues =
                1 -
                (await this.normalizeLog(response.open_issues_count ?? 0, 1000)) // Open issues could be undefined or null
            const normalizedWatchers = await this.normalizeLog(
                response.watchers_count ?? 0,
                3000
            ) // Normalized watchers could be undefined or null
            const wikiScore = response.has_wiki ? 1 : 0
            const pagesScore = response.has_pages ? 1 : 0
            const discussionsScore = response.has_discussions ? 1 : 0

            const weightStargazers = 0.15
            const weightForks = 0.15
            const weightOpenIssues = 0.15
            const weightWatchers = 0.05
            const weightWiki = 0.25
            const weightPages = 0.15
            const weightDiscussions = 0.1

            rampUpScore =
                normalizedStargazers * weightStargazers +
                normalizedForks * weightForks +
                normalizedOpenIssues * weightOpenIssues +
                normalizedWatchers * weightWatchers +
                wikiScore * weightWiki +
                pagesScore * weightPages +
                discussionsScore * weightDiscussions
        } else if (this.apiCall instanceof NpmApiCalls) {
            // We use optional chaining because we are trying to find length of arrays which could throw an error
            const readmeScore = response.readme ? 1 : 0
            const normalizedVersions = await this.normalizeLog(
                response.versions?.length ?? 0,
                50
            )
            const normalizedMaintainers = await this.normalizeLog(
                response.maintainers?.length ?? 0,
                10
            )
            const normalizedDependencies =
                1 -
                (await this.normalizeLog(
                    response.dependencies?.length ?? 0,
                    20
                ))
            const githubRepositoryScore =
                typeof response.repository === 'object' &&
                response.repository?.url?.includes('github')
                    ? 1
                    : 0

            const weightReadme = 0.25
            const weightVersions = 0.2
            const weightMaintainers = 0.15
            const weightDependencies = 0.25
            const weightGithubRepository = 0.15

            rampUpScore =
                readmeScore * weightReadme +
                normalizedVersions * weightVersions +
                normalizedMaintainers * weightMaintainers +
                normalizedDependencies * weightDependencies +
                githubRepositoryScore * weightGithubRepository
        }

        return rampUpScore
    }

    // Log normalization function
    private async normalizeLog(
        value: number,
        maxValue: number
    ): Promise<number> {
        return Math.log(value + 1) / Math.log(maxValue + 1)
    }
}

;(async () => {
    const apiInstance = new ApiCalls(['https://www.npmjs.com/package/express'])
    const APIObj = await apiInstance.callAPI()
    let score = -1

    if (APIObj instanceof NpmApiCalls || APIObj instanceof GitHubApiCalls) {
        let rampUpCalculator = new RampUpTime(APIObj)
        const score = await rampUpCalculator.computeRampUpTime()
    }

    console.log('Ramp-up time score:', score)
})()
