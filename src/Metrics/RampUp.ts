import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import ApiCalls from '../API/api.js';
import { Metrics } from './Metrics.js';
import logger from '../logger.js';


export class RampUpTime extends Metrics{
    public async computeRampUpTime(): Promise<number> {
        logger.info('Starting ramp-up time computation')
        const response = await this.apiCall.handleAPI()

        if (!response){
            logger.error('No response from API')
            return -1
        } 


        let rampUpScore = 0;

        // The approach taken to calculate rampscore is a datascience based approach where the variables are normalized using log normalization
        // then multiplied by the weight of each variable respectively to get the final score
        
        if (this.apiCall instanceof GitHubApiCalls) { // We use nullish coalescing to check if certain variables might return undefined or null
            logger.verbose('Processing GitHub API response');

            const normalizedStargazers = await this.normalizeLog(response.stargazers_count, 10000);
            const normalizedForks = await this.normalizeLog(response.forks_count, 10000);
            const normalizedOpenIssues = 1 - (await this.normalizeLog((response.open_issues_count ?? 0), 1000)); // Open issues could be undefined or null
            const normalizedWatchers = await this.normalizeLog((response.watchers_count ?? 0), 3000); // Normalized watchers could be undefined or null
            const wikiScore = response.has_wiki ? 1 : 0;
            const pagesScore = response.has_pages ? 1 : 0;
            const discussionsScore = response.has_discussions ? 1 : 0;
            
            const readmeContent = await this.apiCall.fetchReadme();
            const readmeLines = readmeContent ? readmeContent.split('\n').length : 0;
            const normalizedReadmeLength = await this.normalizeLog(readmeLines, 400);

            const weightStargazers = 0.10;
            const weightForks = 0.10;
            const weightOpenIssues = 0.15;
            const weightWatchers = 0.05;
            const weightWiki = 0.15;
            const weightPages = 0.10;
            const weightDiscussions = 0.10;
            const readMe = 0.25;

            rampUpScore = (normalizedStargazers * weightStargazers) + (normalizedForks * weightForks) + (normalizedOpenIssues * weightOpenIssues) +
                            (normalizedWatchers * weightWatchers) + (wikiScore * weightWiki) + (pagesScore * weightPages) + (discussionsScore * weightDiscussions) + (normalizedReadmeLength * readMe);

            logger.debug(`Calculated GitHub ramp-up score: ${rampUpScore}`);

        } else if (this.apiCall instanceof NpmApiCalls) { // We use optional chaining because we are trying to find length of arrays which could throw an error
            logger.verbose('Processing NPM API response');

            const normalizedVersions = await this.normalizeLog(Object.keys(response.versions).length, 500);
            const normalizedMaintainers = await this.normalizeLog((response.maintainers?.length ?? 0), 10);
            const normalizedDependencies = 1 - (await this.normalizeLog((response.dependencies?.length ?? 0), 20));
            
            const githubRepositoryScore = (typeof response.repository === 'object' && response.repository?.url?.includes("github")) ? 1 : 0;
            
            const weightVersions = 0.15;
            const weightMaintainers = 0.3;
            const weightDependencies = 0.25;
            const weightGithubRepository = 0.30;
            
            rampUpScore = (normalizedVersions * weightVersions) + (normalizedMaintainers * weightMaintainers) +
                            (normalizedDependencies * weightDependencies) + (githubRepositoryScore * weightGithubRepository);

            logger.debug(`Calculated NPM ramp-up score: ${rampUpScore}`);

            // TAKE CARE OF THIS WHEN MERGING
            if (githubRepositoryScore){
                const githubUrl = response.repository.url.replace(/^git\+/, '').replace(/\.git$/, '')
                logger.info(`Fetching GitHub repository details from: ${githubUrl}`);

                console.log(githubUrl)

                const apiInstance = new ApiCalls([githubUrl])
                const APIObj = await apiInstance.callAPI()

                let githubScore = -1

                if (APIObj instanceof GitHubApiCalls){
                    let githubRampUpCalculator = new RampUpTime(APIObj)
                    githubScore = await githubRampUpCalculator.computeRampUpTime()
                }

                rampUpScore = (rampUpScore*0.3+githubScore*0.7)
                logger.info(`Combined ramp-up score after including GitHub score: ${rampUpScore}`); 
            } 

        }
        logger.info(`Final ramp-up score: ${rampUpScore}`);
        return rampUpScore;
    }

    // Log normalization function
    private async normalizeLog(
        value: number,
        maxValue: number
    ): Promise<number> {
        return Math.log(value + 1) / Math.log(maxValue + 1)
    }
}

(async () => {
    logger.info('Starting local debug call');
    const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
    const gitHubApiObj = await apiInstance.callAPI();
    if (gitHubApiObj instanceof NpmApiCalls || gitHubApiObj instanceof GitHubApiCalls) {
        let correctnessCalculator = new RampUpTime(gitHubApiObj);
        let score = await correctnessCalculator.computeRampUpTime();
        logger.info('RampUpTime score:', score);
    }

})();
