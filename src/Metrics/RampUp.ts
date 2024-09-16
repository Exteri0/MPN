import GitHubApiCalls from '../API/GitHubApiCalls.js';

export default class RampUpTime {
    static calculateRampUpTime(data: any): number {
        const { stargazers_count, forks_count, open_issues_count, watchers_count, has_wiki, has_pages, has_discussions } = data

        const weightStargazers = 0.4
        const weightForks = 0.3
        const weightIssues = 0.2
        const weightWatchers = 0.1
        const weightWiki = has_wiki ? 0.1 : 0
        const weightPages = has_pages ? 0.1 : 0
        const weightDiscussions = has_discussions ? 0.1 : 0

        const rampUpScore = (stargazers_count * weightStargazers) + (forks_count * weightForks) - (open_issues_count * weightIssues) 
                            + (watchers_count * weightWatchers) + weightWiki + weightPages + weightDiscussions

        return rampUpScore
    }
}
