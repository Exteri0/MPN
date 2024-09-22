import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';

/*class BusFactor {
    metricCode: number;
    githubApi: GitHubApiCalls;

    constructor(githubApi: GitHubApiCalls) {
        this.githubApi = githubApi;
        this.metricCode = 0;
    }

    async calcBusFactor(owner: string, repo: string): Promise<void> {
        try {
            // fetch contributors using method in githubapicalls calss
            const contributors = await this.githubApi.fetchContributors(owner, repo);

            if (contributors.length === 0) {
                console.log('No contributors found.');
                this.metricCode = 0;
                return;
            }

            // sort contributors based on the number of commits (largest to smallest)
            contributors.sort((a, b) => b.contributions - a.contributions);

            // calculate total number of commits
            const totalCommits = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);

            // find key contributors that contributed to at least 50% of the total commits
            let cumulativeCommits = 0;
            let keyContributors = 0;

            for (const contributor of contributors) {
                cumulativeCommits += contributor.contributions;
                keyContributors++;

                if (cumulativeCommits >= totalCommits * 0.5) {
                    break;
                }
            }

            // calculate the Bus Factor percentage
            const busFactorPercentage = 1 - (keyContributors / contributors.length);
            this.metricCode = busFactorPercentage * 100;
            console.log(`Bus Factor Calculated: ${this.metricCode}%`);
        } catch (error) {
            console.error('Error while calculating bus factor:', error);
        }
    }
}

export default BusFactor;*/
class BusFactor {
    metricCode: number;
    apiCall: GitHubApiCalls | NpmApiCalls;

    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        this.apiCall = apiCall;
        this.metricCode = 0;
    }

    async calcBusFactor(owner: string = '', repo: string = ''): Promise<void> {  // Default empty strings
        try {
            if (this.apiCall instanceof GitHubApiCalls && (!owner || !repo)) {
                throw new Error('Owner and repo are required for GitHub API calls.');
            }

            // fetch contributors using method in either GitHub or NPM API calls
            const contributors = await this.apiCall.fetchContributors(owner, repo);

            if (contributors.length === 0) {
                console.log('No contributors found.');
                this.metricCode = 0;
                return;
            }

            // sort contributors based on the number of contributions (largest to smallest)
            contributors.sort((a, b) => b.contributions - a.contributions);

            // calculate total number of commits
            const totalCommits = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);

            // find key contributors that contributed to at least 50% of the total commits
            let cumulativeCommits = 0;
            let keyContributors = 0;

            for (const contributor of contributors) {
                cumulativeCommits += contributor.contributions;
                keyContributors++;

                if (cumulativeCommits >= totalCommits * 0.5) {
                    break;
                }
            }

            // calculate the Bus Factor percentage
            const busFactorPercentage = 1 - (keyContributors / contributors.length);
            this.metricCode = busFactorPercentage * 100;
            console.log(`Bus Factor Calculated: ${this.metricCode}%`);
        } catch (error) {
            console.error('Error while calculating bus factor:', error);
        }
    }
}

export default BusFactor;
