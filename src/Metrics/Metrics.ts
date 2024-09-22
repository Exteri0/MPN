import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import ApiCalls from '../API/api.js';
import { measureExecutionTime } from '../utils.js'


export default class Metrics {
    protected apiCall: GitHubApiCalls | NpmApiCalls;
    protected token: string | undefined;
    private netScore: number

    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        this.token = process.env.GITHUB_TOKEN;
        this.apiCall = apiCall;
        this.netScore = 0;
    }
}
export { Metrics };
