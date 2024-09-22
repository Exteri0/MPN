// Correctness.ts

import axios from 'axios';
import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import ApiCalls from '../API/api.js';
import {Metrics} from './Metrics.js';

export class Correctness extends Metrics {
    private weights: { [key: string]: number } = {
        testPresence: 0.25,
        openIssueRatio: 0.20,
        recencyScore: 0.20,
        ciPresence: 0.15,
        documentationPresence: 0.10,
        lintersPresence: 0.10,
    };

    public async computeCorrectness(): Promise<number> {
        const factors: { [key: string]: number } = {};
        factors['testPresence'] = await this.testPresence();
        factors['openIssueRatio'] = 1 - (await this.openIssueRatio());
        factors['recencyScore'] = await this.recencyScore();
        factors['ciPresence'] = await this.ciPresence();
        factors['documentationPresence'] = await this.documentationPresence();
        factors['lintersPresence'] = await this.lintersPresence();

        let correctnessScore = 0;
        for (const key in factors) {
            correctnessScore += this.weights[key] * factors[key];
        }

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
        if (this.isNpmApiCall()) {
            const packageJson = await this.getNpmPackageJson();
            const hasTestScript = packageJson?.scripts && packageJson.scripts['test'];
            return hasTestScript ? 1.0 : 0.0;
        } else if (this.isGithubApiCall()) {
            const hasTestDirectory =
                (await this.hasGithubDirectory('test')) || (await this.hasGithubDirectory('tests'));
            return hasTestDirectory ? 1.0 : 0.0;
        } else {
            return 0.0;
        }
    }

    private async openIssueRatio(): Promise<number> {
        if (this.isGithubApiCall()) {
            const owner = this.apiCall.owner;
            const repo = this.apiCall.repo;

            const openIssuesCount = await this.getGithubOpenIssuesCount(owner, repo);
            const closedIssuesCount = await this.getGithubClosedIssuesCount(owner, repo);
            const totalIssues = openIssuesCount + closedIssuesCount;
            if (totalIssues === 0) {
                return 0.0;
            }
            return openIssuesCount / totalIssues;
        } else {
            return 0.0;
        }
    }

    private async recencyScore(): Promise<number> {
        let lastCommitDate: Date | null = null;

        if (this.isGithubApiCall()) {
            const owner = this.apiCall.owner;
            const repo = this.apiCall.repo;
            lastCommitDate = await this.getGithubLastCommitDate(owner, repo);
        } else if (this.isNpmApiCall()) {
            lastCommitDate = await this.getNpmLastPublishDate();
        } else {
            return 0.0;
        }

        if (!lastCommitDate) {
            return 0.0;
        }

        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastCommitDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Assuming packages updated within the last year (365 days) are recent
        const recencyScore = Math.max(0, (365 - diffDays) / 365);
        return recencyScore;
    }

    private async ciPresence(): Promise<number> {
        if (this.isGithubApiCall()) {
            const ciFiles = ['.travis.yml', '.circleci/config.yml', 'Jenkinsfile'];
            const ciDirectories = ['.github/workflows'];
            const ciPromises = ciFiles.map(file => this.hasGithubFile(file));
            const dirPromises = ciDirectories.map(dir => this.hasGithubDirectory(dir));

            const ciFilesExist = await Promise.all(ciPromises);
            const ciDirsExist = await Promise.all(dirPromises);

            const hasCi = ciFilesExist.includes(true) || ciDirsExist.includes(true);
            return hasCi ? 1.0 : 0.0;
        } else {
            return 0.0;
        }
    }

    private async documentationPresence(): Promise<number> {
        if (this.isGithubApiCall()) {
            const hasReadme =
                (await this.hasGithubFile('README.md')) || (await this.hasGithubFile('README'));
            return hasReadme ? 1.0 : 0.0;
        } else if (this.isNpmApiCall()) {
            const readme = await this.getNpmReadme();
            return readme ? 1.0 : 0.0;
        } else {
            return 0.0;
        }
    }

    private async lintersPresence(): Promise<number> {
        if (this.isGithubApiCall()) {
            const linterFiles = ['.eslintrc', '.eslintrc.js', '.eslint.json', '.tslint.json'];
            const linterPromises = linterFiles.map(file => this.hasGithubFile(file));
            const linterFilesExist = await Promise.all(linterPromises);
            const hasLinter = linterFilesExist.includes(true);
            return hasLinter ? 1.0 : 0.0;
        } else if (this.isNpmApiCall()) {
            const packageJson = await this.getNpmPackageJson();
            const devDependencies = packageJson?.devDependencies || {};
            const hasLinterPackage = devDependencies['eslint'] || devDependencies['tslint'];
            return hasLinterPackage ? 1.0 : 0.0;
        } else {
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
            return response.data.open_issues_count || 0;
        } catch (error) {
            console.error('Error fetching open issues count:', error);
            return 0;
        }
    }

    private async getGithubClosedIssuesCount(owner: string, repo: string): Promise<number> {
        try {
            const response = await axios.get(
                `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`,
                { headers: this.getGithubHeaders() }
            );
            return response.data.total_count || 0;
        } catch (error) {
            console.error('Error fetching closed issues count:', error);
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
            return lastCommitDate ? new Date(lastCommitDate) : null;
        } catch (error) {
            console.error('Error fetching last commit date:', error);
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
            return true;
        } catch (error) {
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
        if (!packageName) return null;
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const latestVersion = response.data['dist-tags'].latest;
            return response.data.versions[latestVersion];
        } catch (error) {
            console.error('Error fetching package.json:', error);
            return null;
        }
    }

    private async getNpmLastPublishDate(): Promise<Date | null> {
        const packageName = this.apiCall.repo; // Assuming 'repo' contains the package name
        if (!packageName) return null;
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const time = response.data.time;
            const latestVersion = response.data['dist-tags'].latest;
            const lastPublishDate = time[latestVersion];
            return lastPublishDate ? new Date(lastPublishDate) : null;
        } catch (error) {
            console.error('Error fetching last publish date:', error);
            return null;
        }
    }

    private async getNpmReadme(): Promise<string | null> {
        const packageName = this.apiCall.repo; // Assuming 'repo' contains the package name
        if (!packageName) return null;
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
            const readme = response.data.readme;
            return readme || null;
        } catch (error) {
            console.error('Error fetching README:', error);
            return null;
        }
    }
};

(async () => {
    const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
    const gitHubApiObj = await apiInstance.callAPI();
    if (gitHubApiObj instanceof NpmApiCalls || gitHubApiObj instanceof GitHubApiCalls) {
        let correctnessCalculator = new Correctness(gitHubApiObj);
        let score = await correctnessCalculator.computeCorrectness();
        console.log('Correctness score:', score);
    }

})();
