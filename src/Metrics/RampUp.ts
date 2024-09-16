import GitHubApiCalls from '../API/GitHubApiCalls.js';

export default class RampUpTime {
    static calculateRampUpTime(data: any): number {
        const { stargazers_count, forks_count, open_issues_count, watchers_count, has_wiki, has_pages, has_discussions } = data

        const normalizedStargazers = Math.log(stargazers_count + 1) / Math.log(5000 + 1); 
        const normalizedForks = Math.log(forks_count + 1) / Math.log(1000 + 1);           
        const normalizedOpenIssues = 1 - Math.log(open_issues_count + 1) / Math.log(200 + 1);
        const normalizedWatchers = Math.log(watchers_count + 1) / Math.log(5000 + 1);

        const wikiScore = has_wiki ? 1 : 0;
        const pagesScore = has_pages ? 1 : 0;
        const discussionsScore = has_discussions ? 1 : 0;

        const weightStargazers = 0.25;
        const weightForks = 0.2;
        const weightOpenIssues = 0.2;
        const weightWatchers = 0.15;
        const weightWiki = 0.1;
        const weightPages = 0.05;
        const weightDiscussions = 0.05;


        const rampUpScore = (normalizedStargazers * weightStargazers) + (normalizedForks * weightForks) + (normalizedOpenIssues * weightOpenIssues) +
                            (normalizedWatchers * weightWatchers) + (wikiScore * weightWiki) + (pagesScore * weightPages) + (discussionsScore * weightDiscussions);

        return rampUpScore
    }
}
