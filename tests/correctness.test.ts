// tests/correctness.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import 'dotenv/config';



import { Correctness } from '../src/Metrics/correctness.js';
import GitHubApiCalls from '../src/API/GitHubApiCalls.js';
import NpmApiCalls from '../src/API/NpmApiCalls.js';
import logger from '../src/logger.js';

// Mock axios
vi.mock('axios');

describe('Correctness', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should compute correctness score for a GitHub repository', async () => {
    // Arrange
    const gitHubApiObj = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiObj.owner = 'user';
    gitHubApiObj.repo = 'repo';

    const correctnessCalculator = new Correctness(gitHubApiObj);

    // Mock axios responses
    vi.spyOn(axios, 'get').mockImplementation(async (url, options) => {
      // Handle the different API calls based on URL
      if (url === 'https://api.github.com/repos/user/repo') {
        // getGithubOpenIssuesCount
        return {
          data: {
            open_issues_count: 5,
          },
        };
      } else if (url === 'https://api.github.com/search/issues?q=repo:user/repo+type:issue+state:closed') {
        // getGithubClosedIssuesCount
        return {
          data: {
            total_count: 15,
          },
        };
      } else if (url === 'https://api.github.com/repos/user/repo/commits') {
        // getGithubLastCommitDate
        return {
          data: [
            {
              commit: {
                committer: {
                  date: new Date().toISOString(),
                },
              },
            },
          ],
        };
      } else if (url.startsWith('https://api.github.com/repos/user/repo/contents/')) {
        // hasGithubFile or hasGithubDirectory
        const path = decodeURIComponent(
          url.replace('https://api.github.com/repos/user/repo/contents/', '')
        );
        // Mock the existence of files or directories based on the path
        const existingPaths = ['test', 'README.md', '.github/workflows', '.eslintrc.js'];
        if (existingPaths.includes(path)) {
          return {
            data: {},
          };
        } else {
          throw { response: { status: 404 } };
        }
      } else {
        // Default response
        return { data: {} };
      }
    });

    // Act
    const score = await correctnessCalculator.computeCorrectness();

    // Assert
    expect(score).toBeCloseTo(0.95, 2); // Expected correctness score is 0.95
  });

  it('should compute correctness score for an NPM package', async () => {
    // Arrange
    const npmApiObj = new NpmApiCalls('https://www.npmjs.com/package/package-name');
    npmApiObj.repo = 'package-name'; // Assuming 'repo' holds the package name

    const correctnessCalculator = new Correctness(npmApiObj);

    // Mock axios responses
    vi.spyOn(axios, 'get').mockImplementation(async (url, options) => {
      if (url === 'https://registry.npmjs.org/package-name') {
        // getNpmPackageJson and getNpmReadme
        return {
          data: {
            'dist-tags': {
              latest: '1.0.0',
            },
            versions: {
              '1.0.0': {
                scripts: {
                  test: 'jest',
                },
                devDependencies: {
                  eslint: '^7.0.0',
                },
              },
            },
            time: {
              '1.0.0': new Date().toISOString(),
            },
            readme: 'Package README content',
          },
        };
      } else {
        return { data: {} };
      }
    });

    // Act
    const score = await correctnessCalculator.computeCorrectness();

    // Assert
    expect(score).toBeCloseTo(0.85, 2); // Expected correctness score is 0.85
  });
});
