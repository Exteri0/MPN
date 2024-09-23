import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RampUpTime } from '../src/Metrics/RampUp.js'; 
import ApiCalls from '../src/API/api.js';
import GitHubApiCalls from '../src/API/GitHubApiCalls.js';
import NpmApiCalls from '../src/API/NpmApiCalls.js';
import logger from '../src/logger.js';


vi.mock('../logger', () => ({
    debug: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
    info: vi.fn(),
}));


// Test suite for RampUpTime
describe('RampUpTime Class', () => {
    let rampUpTime;
    let apiCall;

    beforeEach(() => {
        vi.resetAllMocks();
        apiCall = null;
        rampUpTime = null;
    });

    it('should compute ramp-up time for GitHub API correctly', async () => {

        const apiInstance = new ApiCalls(["https://github.com/Exteri0/MPN"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
        }
    });

    it('should compute ramp-up time for NPM API correctly', async () => {
        const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof NpmApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
        }
    });

    it('should compute ramp-up time for NPM package "wat4hjs" correctly', async () => {
        const apiInstance = new ApiCalls(["https://www.npmjs.com/package/wat4hjs"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof NpmApiCalls) {
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0.4);
            expect(score).toBeLessThan(0.6);
        }
    });

    it('should compute ramp-up time for GitHub repository "three.js" correctly', async () => {
        const apiInstance = new ApiCalls(["https://github.com/mrdoob/three.js/"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls) {
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0.75);
        }
    });

    it('should compute ramp-up time for GitHub repository "libvlc" correctly', async () => {
        const apiInstance = new ApiCalls(["https://github.com/prathameshnetake/libvlc"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls) {
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeLessThan(0.35);
        }
    });    

});
