import GitHubApiCalls from '../API/GitHubApiCalls.js';
import NpmApiCalls from '../API/NpmApiCalls.js';
import ApiCalls from '../API/api.js';
import { Correctness } from './correctness.js';

export default class Metrics {
    protected apiCall: GitHubApiCalls | NpmApiCalls;
    protected token: string | undefined;
    private netScore: number

    constructor(apiCall: GitHubApiCalls | NpmApiCalls) {
        this.token = process.env.GITHUB_TOKEN;
        this.apiCall = apiCall;
        this.netScore = 0;
    }

    public async calculateCorrectness(): Promise<number> {
        let correctnessCalculator: Correctness = new Correctness(this.apiCall);
        let score = correctnessCalculator.computeCorrectness();
        return score;
    }
    //public async calculate correctness latency

    public async calculateNetScore(): Promise<number> {
        let scoreCorrectness = await this.calculateCorrectness();
        
        return this.netScore;

       
    }


 }
