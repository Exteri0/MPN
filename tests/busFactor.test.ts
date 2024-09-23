import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusFactor from '../src/Metrics/busFactor.js';  
import GitHubApiCalls from '../src/API/GitHubApiCalls.js';
import NpmApiCalls from '../src/API/NpmApiCalls.js';
import logger from '../src/logger';

// mock the GitHubApiCalls class
vi.mock('/home/shay/a/manjuna0/461/MPNFork/src/API/GitHubApiCalls.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            fetchContributors: vi.fn()
        }))
    };
});

// mock the NpmApiCalls class
vi.mock('/home/shay/a/manjuna0/461/MPNFork/src/API/NpmApiCalls.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            fetchContributors: vi.fn()
        }))
    };
});

vi.mock('../logger', () => {
    return {
        default: {
            info: vi.fn(),
            error: vi.fn(),
        },
    };
});


describe('BusFactor Class with GitHub API Calls', () => {
    let githubApiCalls: GitHubApiCalls;
    let busFactor: BusFactor;

    beforeEach(() => {
        githubApiCalls = new GitHubApiCalls('https://api.github.com');
        busFactor = new BusFactor(githubApiCalls);
    });

    it('should calculate bus factor percentage with few key contributors controlling over 50% of commits (many minor contributors)', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { login: 'contributor1', contributions: 300 },  // Key contributor
            { login: 'contributor2', contributions: 200 },  // Key contributor
            { login: 'contributor3', contributions: 50 },
            { login: 'contributor4', contributions: 30 },
            { login: 'contributor5', contributions: 20 },
            { login: 'contributor6', contributions: 10 },
            { login: 'contributor7', contributions: 5 },
            { login: 'contributor8', contributions: 3 },
            { login: 'contributor9', contributions: 2 },
            { login: 'contributor10', contributions: 1 }
        ]);

        await busFactor.calcBusFactor('owner', 'repo');

        // total commits = 621, contributors 1 and 2 account for 500 commits (over 50%)
        expect(busFactor.metricCode).toBeCloseTo(80, 2);  
    });

    it('should calculate bus factor with very few contributors making the majority of commits (more than 50%)', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { login: 'contributor1', contributions: 400 },  // Key contributor
            { login: 'contributor2', contributions: 100 },  // Key contributor
            { login: 'contributor3', contributions: 50 },
            { login: 'contributor4', contributions: 40 },
            { login: 'contributor5', contributions: 30 },
            { login: 'contributor6', contributions: 20 },
            { login: 'contributor7', contributions: 15 },
            { login: 'contributor8', contributions: 10 },
            { login: 'contributor9', contributions: 5 },
            { login: 'contributor10', contributions: 2 }
        ]);

        await busFactor.calcBusFactor('owner', 'repo');

        // total commits = 672, contributors 1 and 2 account for 500 commits 
        expect(busFactor.metricCode).toBeCloseTo(90, 2);
    });

    it('should calculate bus factor with even more minor contributors and fewer key contributors', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { login: 'contributor1', contributions: 350 },  // Key contributor
            { login: 'contributor2', contributions: 150 },  // Key contributor
            { login: 'contributor3', contributions: 30 },
            { login: 'contributor4', contributions: 25 },
            { login: 'contributor5', contributions: 20 },
            { login: 'contributor6', contributions: 15 },
            { login: 'contributor7', contributions: 10 },
            { login: 'contributor8', contributions: 5 },
            { login: 'contributor9', contributions: 2 },
            { login: 'contributor10', contributions: 1 },
            { login: 'contributor11', contributions: 1 }
        ]);

        await busFactor.calcBusFactor('owner', 'repo');

        // total commits = 609, contributors 1 and 2 account for 500 commits
        expect(busFactor.metricCode).toBeCloseTo(90.91, 2); 
    });

    it('should handle errors in calcBusFactor for GitHub', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockRejectedValue(new Error('API Error'));

        const loggerErrorSpy = vi.spyOn(logger, 'error');

        await busFactor.calcBusFactor('owner', 'repo');

        expect(loggerErrorSpy).toHaveBeenCalledWith('Error while calculating bus factor:', expect.any(Error));
    });
});

describe('BusFactor Class with NPM API Calls', () => {
    let npmApiCalls: NpmApiCalls;
    let busFactor: BusFactor;

    beforeEach(() => {
        npmApiCalls = new NpmApiCalls('https://registry.npmjs.org');
        busFactor = new BusFactor(npmApiCalls);
    });

    it('should calculate bus factor percentage for an NPM package with many contributors and few key contributors', async () => {
        npmApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { name: 'contributor1', contributions: 400 },  // Key contributor
            { name: 'contributor2', contributions: 100 },  // Key contributor
            { name: 'contributor3', contributions: 50 },
            { name: 'contributor4', contributions: 40 },
            { name: 'contributor5', contributions: 30 },
            { name: 'contributor6', contributions: 20 },
            { name: 'contributor7', contributions: 10 },
            { name: 'contributor8', contributions: 5 },
            { name: 'contributor9', contributions: 2 },
            { name: 'contributor10', contributions: 1 }
        ]);
    
        await busFactor.calcBusFactor('owner', 'npm-package');
    
        expect(busFactor.metricCode).toBeCloseTo(90, 2);
    });
    

    it('should handle errors in calcBusFactor for NPM packages', async () => {
        npmApiCalls.fetchContributors = vi.fn().mockRejectedValue(new Error('API Error'));

        const loggerErrorSpy = vi.spyOn(logger, 'error');

        await busFactor.calcBusFactor('owner', 'npm-package');

        expect(loggerErrorSpy).toHaveBeenCalledWith('Error while calculating bus factor:', expect.any(Error));
    });
});