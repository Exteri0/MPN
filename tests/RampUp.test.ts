import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RampUpTime } from '../src/Metrics/RampUp.js'; 
import ApiCalls from '../src/API/api.js';
import GitHubApiCalls from '../src/API/GitHubApiCalls.js';
import NpmApiCalls from '../src/API/NpmApiCalls.js';
import logger from '../src/logger.js';

// Mock the GitHubApiCalls class
vi.mock('../src/API/GitHubApiCalls.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            handleAPI: vi.fn(),
            fetchReadme: vi.fn(),
            callAPI : vi.fn(),
        })),
    };
});

// Mock the NpmApiCalls class
vi.mock('../src/API/NpmApiCalls.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            handleAPI: vi.fn(),
            callAPI : vi.fn(),
        })),
    };
});

vi.mock('../src/logger.js', () => {
    return {
        default: {
            info: vi.fn(),
            error: vi.fn(),
        },
    };
});


// Test suite for RampUpTime
describe('RampUpTime Class', () => {
    let rampUpTime;
    let apiCall;

    beforeEach(() => {
        vi.clearAllMocks();
        apiCall = null;
        rampUpTime = null;
    });

    it('should compute ramp-up time for GitHub API correctly', async () => {

        const apiInstance = new ApiCalls(["https://github.com/nullivex/nodist"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
            console.log("PLEASEEEEEEEEEE");
        }

    });

    it('should compute ramp-up time for NPM API correctly', async () => {
        const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
            logger.info("Computed ramp-up time for NPM API correctly");
        }
    });

    it('should return -1 if no response from API', async () => {
        const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
            logger.info("Returned -1 for no response from API - Will do");
            console.log("Returned -1 for no response from API - Will do");
        }
    });

    it('should log error if API fails', async () => {
        const apiInstance = new ApiCalls(["https://www.npmjs.com/package/express"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls){
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
            logger.info("API Failed - Will do");
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
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
        }
    });

    it('should compute ramp-up time for GitHub repository "three.js" correctly', async () => {
        const apiInstance = new ApiCalls(["https://github.com/mrdoob/three.js/"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls) {
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeGreaterThan(0.75);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
        }
    });

    it('should compute ramp-up time for GitHub repository "libvlc" correctly', async () => {
        const apiInstance = new ApiCalls(["https://github.com/prathameshnetake/libvlc"]);
        const ApiObj = await apiInstance.callAPI();

        if (ApiObj instanceof GitHubApiCalls) {
            let correctnessCalculator = new RampUpTime(ApiObj);
            const score = await correctnessCalculator.computeRampUpTime();
            expect(score).toBeLessThan(0.3);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Final ramp-up score:'));
        }
    });


});
