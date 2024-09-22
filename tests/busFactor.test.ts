import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusFactor from '../src/Metrics/busFactor.js';  
import GitHubApiCalls from '../src/API/GitHubApiCalls.js'; 
import ApiCalls from '../src/API/apiCalls.js'

// Mock the GitHubApiCalls class
vi.mock('../GitHubApiCalls', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            fetchContributors: vi.fn() // We will mock this method
        }))
    };
});

describe('BusFactor Class', () => {
    let githubApiCalls: GitHubApiCalls;
    let busFactor: BusFactor;

    beforeEach(() => {
        // placeholder url
        githubApiCalls = new GitHubApiCalls('https://api.github.com');
        busFactor = new BusFactor(githubApiCalls);
    });

    it('should calculate bus factor with key contributors', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { contributions: 100, login: 'contributor1' },
            { contributions: 60, login: 'contributor2' },
            { contributions: 10, login: 'contributor3' },
        ]);

        await busFactor.calcBusFactor('owner', 'repo');

        expect(busFactor.metricCode).toBe(2);
    });

    it('should calculate bus factor with no key contributors', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockResolvedValue([
            { contributions: 20, login: 'contributor1' },
            { contributions: 10, login: 'contributor2' },
        ]);

        await busFactor.calcBusFactor('owner', 'repo');

        expect(busFactor.metricCode).toBe(0);
    });

    it('should handle errors in calcBusFactor', async () => {
        githubApiCalls.fetchContributors = vi.fn().mockRejectedValue(new Error('API Error'));

        const consoleErrorSpy = vi.spyOn(console, 'error');

        await busFactor.calcBusFactor('owner', 'repo');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error while calculating bus factor:', expect.any(Error));
    });
});
