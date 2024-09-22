import GitHubApiCalls from '../API/GitHubApiCalls.js';
import apiCalls from '../API/apiCalls.js'
class BusFactor {
    metricCode: number;
    githubApi: GitHubApiCalls;

    constructor(githubApi: GitHubApiCalls) {
        this.githubApi = githubApi;
        this.metricCode = 0;
    }

    // sets the bus factor score
    setMetricCode(code: number): void {
        this.metricCode = code;
    }

    // new method added ot githubapicalls to fetch contributors
    async fetchContributors(owner: string, repo: string): Promise<any[]> {
        return await this.githubApi.fetchContributors(owner, repo);
    }
    async calcBusFactor(owner: string, repo: string): Promise<void> {
        try {
            const contributors = await this.fetchContributors(owner, repo);

            if (contributors.length > 0) {
                const keyContributors = contributors.filter(
                    (contributor: any) => contributor.contributions > 50
                );
                this.metricCode = keyContributors.length;
                console.log(`Bus Factor Calculated: ${this.metricCode}`);
            } else {
                console.log('No key contributors found.');
            }
        } catch (error) {
            console.error('Error while calculating bus factor:', error);
        }
    }
}

export default BusFactor;
