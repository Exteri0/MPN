// tests/correctness.test.ts

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { Correctness } from '../src/Metrics/correctness.js';
import GitHubApiCalls from '../src/API/GitHubApiCalls.js';
import NpmApiCalls from '../src/API/NpmApiCalls.js';
import logger from '../src/logger.js';

// Mock axios
vi.mock('axios');

describe('Correctness Metric', () => {
  let correctness: Correctness;
  let gitHubApiCall: GitHubApiCalls;
  let npmApiCall: NpmApiCalls;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock logger to avoid cluttering test output
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('computeCorrectness for GitHub repository', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Map of file/directory existence
    const fileExistsMap: { [key: string]: boolean } = {
      'test': true,
      'tests': false,
      'README.md': true,
      '.github/workflows': true,
      '.travis.yml': false,
      '.eslintrc': true,
      '.eslintrc.js': false,
      '.eslint.json': false,
      '.tslint.json': false,
    };

    // Mock methods
    vi.spyOn(correctness, 'hasGithubFile').mockImplementation((path: string) => {
      return Promise.resolve(fileExistsMap[path] || false);
    });

    vi.spyOn(correctness, 'hasGithubDirectory').mockImplementation((path: string) => {
      return Promise.resolve(fileExistsMap[path] || false);
    });

    vi.spyOn(correctness, 'getGithubOpenIssuesCount').mockResolvedValue(10);
    vi.spyOn(correctness, 'getGithubClosedIssuesCount').mockResolvedValue(90);
    vi.spyOn(correctness, 'getGithubLastCommitDate').mockResolvedValue(new Date());

    // Call computeCorrectness
    const score = await correctness.computeCorrectness();

    // Calculate expected score
    const openIssueRatio = 10 / (10 + 90); // 0.1
    const expectedScore =
      0.25 * 1.0 + // testPresence
      0.20 * (1 - openIssueRatio) + // openIssueRatio
      0.20 * 1.0 + // recencyScore
      0.15 * 1.0 + // ciPresence
      0.10 * 1.0 + // documentationPresence
      0.10 * 1.0; // lintersPresence

    expect(score).toBeCloseTo(expectedScore);
  });

  test('computeCorrectness for NPM package', async () => {
    // Create a mock NpmApiCalls instance
    npmApiCall = new NpmApiCalls('package-name');
    npmApiCall.repo = 'package-name';

    correctness = new Correctness(npmApiCall);

    // Mock methods
    vi.spyOn(correctness, 'getNpmPackageJson').mockResolvedValue({
      scripts: {
        test: 'echo "Running tests..."',
      },
      devDependencies: {
        eslint: '^7.0.0',
      },
    });

    vi.spyOn(correctness, 'getNpmLastPublishDate').mockResolvedValue(new Date());
    vi.spyOn(correctness, 'getNpmReadme').mockResolvedValue('This is the README');

    // Call computeCorrectness
    const score = await correctness.computeCorrectness();

    // Calculate expected score
    const expectedScore =
      0.25 * 1.0 + // testPresence
      0.20 * 1.0 + // openIssueRatio (not applicable, so default to 1.0)
      0.20 * 1.0 + // recencyScore
      0.15 * 0.0 + // ciPresence (not applicable)
      0.10 * 1.0 + // documentationPresence
      0.10 * 1.0; // lintersPresence

    expect(score).toBeCloseTo(expectedScore);
  });

  test('openIssueRatio when total issues is zero', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Mock methods
    vi.spyOn(correctness, 'getGithubOpenIssuesCount').mockResolvedValue(0);
    vi.spyOn(correctness, 'getGithubClosedIssuesCount').mockResolvedValue(0);

    const ratio = await correctness['openIssueRatio']();

    expect(ratio).toBe(0.0);
  });

  test('recencyScore when last commit date is null', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Mock methods
    vi.spyOn(correctness, 'getGithubLastCommitDate').mockResolvedValue(null);

    const score = await correctness['recencyScore']();

    expect(score).toBe(0.0);
  });

  test('recencyScore when last commit was over a year ago', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Mock methods
    const lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 2); // Two years ago
    vi.spyOn(correctness, 'getGithubLastCommitDate').mockResolvedValue(lastYearDate);

    const score = await correctness['recencyScore']();

    expect(score).toBe(0.0);
  });

  test('lintersPresence when no linter files are present', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Mock methods
    vi.spyOn(correctness, 'hasGithubFile').mockResolvedValue(false);

    const score = await correctness['lintersPresence']();

    expect(score).toBe(0.0);
  });

  test('computeCorrectness logs start and end messages', async () => {
    // Create a mock GitHubApiCalls instance
    gitHubApiCall = new GitHubApiCalls('https://github.com/user/repo');
    gitHubApiCall.owner = 'user';
    gitHubApiCall.repo = 'repo';

    correctness = new Correctness(gitHubApiCall);

    // Mock methods
    vi.spyOn(correctness, 'testPresence').mockResolvedValue(1.0);
    vi.spyOn(correctness, 'openIssueRatio').mockResolvedValue(0.1);
    vi.spyOn(correctness, 'recencyScore').mockResolvedValue(1.0);
    vi.spyOn(correctness, 'ciPresence').mockResolvedValue(1.0);
    vi.spyOn(correctness, 'documentationPresence').mockResolvedValue(1.0);
    vi.spyOn(correctness, 'lintersPresence').mockResolvedValue(1.0);

    const loggerInfoSpy = vi.spyOn(logger, 'info');

    // Call computeCorrectness
    const score = await correctness.computeCorrectness();

    expect(loggerInfoSpy).toHaveBeenCalledWith('Starting computation of Correctness metric.');
    expect(loggerInfoSpy).toHaveBeenCalledWith(`Correctness score computed: ${score}`);
  });
});
