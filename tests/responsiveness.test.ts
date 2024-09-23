/// <reference types="vitest" />

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Responsiveness } from '../src/Metrics/responsiveness.js'
import GitHubApiCalls from '../src/API/GitHubApiCalls.js'
import NpmApiCalls from '../src/API/NpmApiCalls.js'
import {differenceInHours} from '../src/utils.js'
import logger from '../src/logger.js'
import axios from 'axios'

// Mock axios
vi.mock('axios')

describe('Responsiveness Metric', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.spyOn(logger, 'info')
        vi.spyOn(logger, 'warn')
        vi.spyOn(logger, 'error')
        vi.spyOn(logger, 'debug')
        vi.spyOn(logger, 'verbose')
        vi.spyOn(differenceInHours, 'differenceInHours').mockImplementation((start: any, end: any) => {
            const diffMs = new Date(end).getTime() - new Date(start).getTime()
            return Math.floor(diffMs / (1000 * 60 * 60)) // Convert ms to hours
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should compute responsiveness score for a GitHub repository', async () => {
        // Arrange
        const gitHubApiObj = new GitHubApiCalls('https://github.com/user/repo')
        gitHubApiObj.owner = 'user'
        gitHubApiObj.repo = 'repo'

        const responsivenessCalculator = new Responsiveness(gitHubApiObj)

        // Mock axios responses for GitHub API calls
        vi.spyOn(axios, 'get').mockImplementation(async (url) => {
            if (
                url ===
                'https://api.github.com/repos/user/repo/issues?state=all&per_page=100'
            ) {
                return {
                    data: [
                        {
                            number: 1,
                            created_at: new Date().toISOString(),
                            pull_request: null,
                        },
                        {
                            number: 2,
                            created_at: new Date().toISOString(),
                            closed_at: new Date().toISOString(),
                            pull_request: null,
                        },
                    ],
                }
            } else if (
                url ===
                'https://api.github.com/repos/user/repo/issues/1/comments'
            ) {
                return {
                    data: [
                        {
                            created_at: new Date(
                                Date.now() + 2 * 60 * 60 * 1000
                            ).toISOString(),
                        },
                    ],
                }
            } else if (
                url ===
                'https://api.github.com/repos/user/repo/issues/2/comments'
            ) {
                return { data: [] }
            } else {
                return { data: [] }
            }
        })

        // Act
        const score = await responsivenessCalculator.ComputeResponsiveness()

        // Assert
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
        expect(logger.info).toHaveBeenCalled()
        expect(logger.debug).toHaveBeenCalled()
        expect(logger.verbose).toHaveBeenCalled()
    })

    it('should compute responsiveness score for an NPM package', async () => {
        // Arrange
        const npmApiObj = new NpmApiCalls(
            'https://www.npmjs.com/package/express'
        )
        npmApiObj.repo = 'express'

        const responsivenessCalculator = new Responsiveness(npmApiObj)

        // Mock axios responses for GitHub API calls (after fetching repository info from NPM)
        vi.stubGlobal('fetch', vi.fn())

        ;(fetch as unknown as vi.Mock).mockResolvedValueOnce({
            json: async () => ({
                repository: { url: 'https://github.com/user/repo' },
            }),
        })

        vi.spyOn(axios, 'get').mockImplementation(async (url) => {
            if (
                url ===
                'https://api.github.com/repos/user/repo/issues?state=all&per_page=100'
            ) {
                return {
                    data: [
                        {
                            number: 1,
                            created_at: new Date().toISOString(),
                            pull_request: null,
                        },
                        {
                            number: 2,
                            created_at: new Date().toISOString(),
                            closed_at: new Date().toISOString(),
                            pull_request: null,
                        },
                    ],
                }
            } else if (
                url ===
                'https://api.github.com/repos/user/repo/issues/1/comments'
            ) {
                return {
                    data: [
                        {
                            created_at: new Date(
                                Date.now() + 3 * 60 * 60 * 1000
                            ).toISOString(),
                        },
                    ],
                }
            } else {
                return { data: [] }
            }
        })

        // Act
        const score = await responsivenessCalculator.ComputeResponsiveness()

        // Assert
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
        expect(logger.info).toHaveBeenCalled()
        expect(logger.debug).toHaveBeenCalled()
        expect(logger.verbose).toHaveBeenCalled()
    })
})
