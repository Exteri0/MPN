// correctness.ts

import axios from 'axios';
import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import ApiCalls from '../API/api.js';
import { Metrics } from './Metrics.js';
import logger from '../logger.js'; // Import the logger
import { measureExecutionTime } from '../utils.js'


export class Correctness extends Metrics {
    private metricCode: number;
    private weights: { [key: string]: number } = {
        testPresence: 0.25,
        openIssueRatio: 0.20,
        recencyScore: 0.20,
        ciPresence: 0.15,
        documentationPresence: 0.10,
        lintersPresence: 0.10,
    };
    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        super(apiCall);
        this.metricCode = 1;
    }

    public async computeCorrectness(): Promise<number> {
        logger.info('Starting computation of Correctness metric.');

        const factors: { [key: string]: number } = {};
        factors['testPresence'] = await this.testPresence();
        factors['openIssueRatio'] = 1 - (await this.openIssueRatio());
        factors['recencyScore'] = await this.recencyScore();
        factors['ciPresence'] = await this.ciPresence();
        factors['documentationPresence'] = await this.documentationPresence();
        factors['lintersPresence'] = await this.lintersPresence();

        logger.debug('Computed factors:', factors);

        let correctnessScore = 0;
        for (const key in factors) {
            correctnessScore += this.weights[key] * factors[key];
        }

        logger.info(`Correctness score computed: ${correctnessScore}`);
        return correctnessScore;
    }

    private isGithubApiCall(): boolean {
        return this.apiCall instanceof GitHubApiCalls;
    }

    private isNpmApiCall(): boolean {
        return this.apiCall instanceof NpmApiCalls;
    }

    // Function to get headers for GitHub API requests
    private getGithubHeaders(): { [key: string]: string } {
        const headers: { [key: string]: string } = {
            Accept: 'application/vnd.github.v3+json',
        };
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        return headers;
    }

    private async testPresence(): Promise<number> {
        logger.info('Checking for test presence.');
        if (this.isNpmApiCall()) {
            const packageJson = await this.getNpmPackageJson();
            const hasTestScript = packageJson?.scripts && packageJson.scripts['test'];
            logger.debug(`NPM package has test script: ${hasTestScript}`);
            return hasTestScript ? 1.0 : 0.0;
        } else if (this.isGithubApiCall()) {
            const hasTestDirectory =
                (await this.hasGithubDirectory('test')) || (await this.hasGithubDirectory('tests'));
            logger.debug(`GitHub repo has test directory: ${hasTestDirectory}`);
            return hasTestDirectory ? 1.0 : 0.0;
        } else {
            logger.warn('Unknown API call type for test presence check.');
            return 0.0;
        }
    }

    private async openIssueRatio(): Promise<number> {
        logger.info('Calculating open issue ratio.');
        if (this.isGithubApiCall()) {
            const owner = this.apiCall.owner;
            const repo = this.apiCall.repo;

            const openIssuesCount = await this.getGithubOpenIssuesCount(owner, repo);
            const closedIssuesCount = await this.getGithubClosedIssuesCount(owner, repo);
            const totalIssues = openIssuesCount + closedIssuesCount;

            logger.debug(`Open issues: ${openIssuesCount}, Closed issues: ${closedIssuesCount}, Total issues: ${totalIssues}`);

            if (totalIssues === 0) {
                logger.warn('Total issues count is zero. Returning ratio as 0.0.');
                return 0.0;
            }
            return openIssuesCount / totalIssues;
        } else {
            logger.warn('Open issue ratio calculation is only applicable for GitHub repositories.');
            return 0.0;
        }
    }

    private async recencyScore(): Promise<number> {
        logger.info('Calculating recency score.');
        let lastCommitDate: Date | null = null;

        if (this.isGithubApiCall()) {
            const owner = this.apiCall.owner;
            const repo = this.apiCall.repo;
            lastCommitDate = await this.getGithubLastCommitDate(owner, repo);
        } else if (this.isNpmApiCall()) {
            lastCommitDate = await this.getNpmLastPublishDate();
        } else {
            logger.warn('Recency score calculation is not applicable.');
            return 0.0;
        }

        if (!lastCommitDate) {
            logger.warn('Last commit/publish date is not available. Returning score as 0.0.');
            return 0.0;
        }

        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastCommitDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Assuming packages updated within the last year (365 days) are recent
        const recencyScore = Math.max(0, (365 - diffDays) / 365);
        logger.debug(`Last update was ${diffDays} days ago. Recency score: ${recencyScore}`);
        return recencyScore;
    }

    private async ciPresence(): Promise<number> {
        logger.info('Checking for CI presence.');
        if (this.isGithubApiCall()) {
            const ciFiles = ['.travis.yml', '.circleci/config.yml', 'Jenkinsfile'];
            const ciDirectories = ['.github/workflows'];
            const ciPromises = ciFiles.map(file => this.hasGithubFile(file));
            const dirPromises = ciDirectories.map(dir => this.hasGithubDirectory(dir));

            const ciFilesExist = await Promise.all(ciPromises);
            const ciDirsExist = await Promise.all(dirPromises);

            const hasCi = ciFilesExist.includes(true) || ciDirsExist.includes(true);
            logger.debug(`CI presence: ${hasCi}`);
            return hasCi ? 1.0 : 0.0;
        } else {
            logger.warn('CI presence check is only applicable for GitHub repositories.');
            return 0.0;
        }
    }

    private async documentationPresence(): Promise<number> {
        logger.info('Checking for documentation presence.');
        if (this.isGithubApiCall()) {
            const hasReadme =
                (await this.hasGithubFile('README.md')) || (await this.hasGithubFile('README'));
            logger.debug(`GitHub repo has README: ${hasReadme}`);
            return hasReadme ? 1.0 : 0.0;
        } else if (this.isNpmApiCall()) {
            const readme = await this.getNpmReadme();
            logger.debug(`NPM package has README: ${!!readme}`);
            return readme ? 1.0 : 0.0;
        } else {
            logger.warn('Documentation presence check is not applicable.');
            return 0.0;
        }
    }

    private async lintersPresence(): Promise<number> {
        logger.info('Checking for linters presence.');
        if (this.isGithubApiCall()) {
            const linterFiles = ['.eslintrc', '.eslintrc.js', '.eslint.json', '.tslint.json'];
            const linterPromises = linterFiles.map(file => this.hasGithubFile(file));
            const linterFilesExist = await Promise.all(linterPromises);
            const hasLinter = linterFilesExist.includes(true);
            logger.debug(`Linters presence in GitHub repo: ${hasLinter}`);
            return hasLinter ? 1.0 : 0.0;
        } else if (this.isNpmApiCall()) {
            const packageJson = await this.getNpmPackageJson();
            const devDependencies = packageJson?.devDependencies || {};
            const hasLinterPackage = devDependencies['eslint'] || devDependencies['tslint'];
            logger.debug(`Linters presence in NPM package: ${!!hasLinterPackage}`);
            return hasLinterPackage ? 1.0 : 0.0;
        } else {
            logger.warn('Linters presence check is not applicable.');
            return 0.0;
        }
    }

    // Helper functions for GitHub

    private async getGithubOpenIssuesCount(owner: string, repo: string): Promise<number> {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}`,
                { headers: this.getGithubHeaders() }
            );
            const openIssues = response.data.open_issues_count || 0;
            logger.debug(`Fetched open issues count: ${openIssues}`);
            return openIssues;
        } catch (error) {
            logger.error('Error fetching open issues count:', error);
            return 0;
        }
    }

    private async getGithubClosedIssuesCount(owner: string, repo: string): Promise<number> {
        try {
            const response = await axios.get(
                `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`,
                { headers: this.getGithubHeaders() }
            );
            const closedIssues = response.data.total_count || 0;
            logger.debug(`Fetched closed issues count: ${closedIssues}`);
            return closedIssues;
        } catch (error) {
            logger.error('Error fetching closed issues count:', error);
            return 0;
        }
    }

    private async getGithubLastCommitDate(owner: string, repo: string): Promise<Date | null> {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/commits`,
                { headers: this.getGithubHeaders() }
            );
            const lastCommitDate = response.data[0]?.commit?.committer?.date;
            logger.debug(`Fetched last commit date: ${lastCommitDate}`);
            return lastCommitDate ? new Date(lastCommitDate) : null;
        } catch (error) {
            logger.error('Error fetching last commit date:', error);
            return null;
        }
    }

    private async hasGithubFile(path: string): Promise<boolean> {
        const owner = this.apiCall.owner;
        const repo = this.apiCall.repo;
        try {
            await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
                { headers: this.getGithubHeaders() }
            );
            logger.debug(`File ${path} exists in GitHub repo.`);
            return true;
        } catch (error) {
            logger.debug(`File ${path} does not exist in GitHub repo.`);
            return false;
        }
    }

    private async hasGithubDirectory(path: string): Promise<boolean> {
        // In GitHub API, files and directories are both 'contents'
        return this.hasGithubFile(path);
    }

    // Helper functions for NPM

    private async getNpmPackageJson(): Promise<any> {
        const packageName = this.apiCall.repo; // Assuming 'repo' contains the package name
        if (!packageName) {
            logger.warn('Package name is not available.');
            return null;
        }
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const latestVersion = response.data['dist-tags'].latest;
            const packageJson = response.data.versions[latestVersion];
            logger.debug(`Fetched package.json for version ${latestVersion}`);
            return packageJson;
        } catch (error) {
            logger.error('Error fetching package.json:', error);
            return null;
        }
    }

    private async getNpmLastPublishDate(): Promise<Date | null> {
        const packageName = this.apiCall.repo; // Assuming 'repo' contains the package name
        if (!packageName) {
            logger.warn('Package name is not available.');
            return null;
        }
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const time = response.data.time;
            const latestVersion = response.data['dist-tags'].latest;
            const lastPublishDate = time[latestVersion];
            logger.debug(`Fetched last publish date: ${lastPublishDate}`);
            return lastPublishDate ? new Date(lastPublishDate) : null;
        } catch (error) {
            logger.error('Error fetching last publish date:', error);
            return null;
        }
    }

    private async getNpmReadme(): Promise<string | null> {
        const packageName = this.apiCall.repo; // Assuming 'repo' contains the package name
        if (!packageName) {
            logger.warn('Package name is not available.');
            return null;
        }
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const readme = response.data.readme;
            logger.debug('Fetched README from NPM package.');
            return readme || null;
        } catch (error) {
            logger.error('Error fetching README:', error);
            return null;
        }
    }

}

// Test code at the end of the file
/* (async () => {
    const apiInstance = new ApiCalls(["https://github.com/nullivex/nodist"]);
    const gitHubApiObj = await apiInstance.callAPI();
    if (gitHubApiObj instanceof NpmApiCalls || gitHubApiObj instanceof GitHubApiCalls) {
        const correctnessCalculator = new Correctness(gitHubApiObj);
        const score = await correctnessCalculator.computeCorrectness();
        console.log('Correctness score:', score); // Explicit output to stdout
    } else {
        logger.error('Failed to create API object for correctness calculation.');
    }
})(); */
