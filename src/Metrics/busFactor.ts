import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import Metrics from '../Metrics/Metrics.js'
import logger from '../logger.js';


class BusFactor extends Metrics {
    metricCode: number;

    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        super(apiCall);
        this.metricCode = 0;
    }

    async calcBusFactor(owner: string = '', repo: string = ''): Promise<number | void> { 
        try {
            if (this.apiCall instanceof GitHubApiCalls && (!owner || !repo)) {
                throw new Error('Owner and repo are required for GitHub API calls.');
            }

            // fetch contributors using method in either GitHub or NPM API calls
            const contributors = await this.apiCall.fetchContributors(owner, repo);

            if (contributors.length === 0) {
                logger.info('No contributors found.')
                this.metricCode = 0;
                return -1;
            }

            // sort contributors based on the number of contributions (largest to smallest)
            contributors.sort((a, b) => b.contributions - a.contributions);

            // calculate total number of commitss
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
            this.metricCode = busFactorPercentage;
            logger.info(`Bus Factor Calculated: ${this.metricCode}%`);
        } catch (error) {
            logger.error('Error while calculating bus factor:', error);
        }
    }
}

export default BusFactor;
