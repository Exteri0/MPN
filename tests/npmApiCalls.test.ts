// tests/npmApiCalls.test.ts

/// <reference types="vitest" />

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'

// Set environment variables before importing logger and other modules
process.env.LOG_FILE = 'myLog.log'
process.env.LOG_LEVEL = 'debug' // Optional: set desired log level for testing

import NpmApiCalls from '../src/API/NpmApiCalls'
import logger from '../src/logger'

// Mock fetch
vi.stubGlobal('fetch', vi.fn())

describe('NpmApiCalls Class', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks()

        // Spy on logger methods
        vi.spyOn(logger, 'info')
        vi.spyOn(logger, 'warn')
        vi.spyOn(logger, 'error')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should log API call when handleAPI is invoked', async () => {
        // Arrange
        const packageName = 'express'
        const npmApiCalls = new NpmApiCalls(
            `https://www.npmjs.com/package/${packageName}`
        )
        npmApiCalls.repo = packageName // Assuming 'repo' holds the package name

        // Mock fetch response
        const mockResponse = {
            name: packageName,
            version: '1.0.0',
        }

        ;(fetch as unknown as vi.Mock).mockResolvedValue({
            json: async () => mockResponse,
        })

        // Act
        const res = await npmApiCalls.handleAPI()

        // Assert
        expect(res).toEqual(mockResponse)
        expect(logger.info).toHaveBeenCalledWith(
            `Making API call to npm: ${packageName}`
        )
        expect(fetch).toHaveBeenCalledWith(
            `https://registry.npmjs.org/${packageName}`
        )
    })

    it('should fetch contributors correctly', async () => {
        // Arrange
        const packageName = 'express'
        const npmApiCalls = new NpmApiCalls(
            `https://www.npmjs.com/package/${packageName}`
        )
        npmApiCalls.repo = packageName

        // Mock fetch response
        const mockResponse = {
            contributors: [{ name: 'John Doe', email: 'john@example.com' }],
        }

        ;(fetch as unknown as vi.Mock).mockResolvedValue({
            json: async () => mockResponse,
        })

        // Act
        const contributors = await npmApiCalls.fetchContributors()

        // Assert
        expect(contributors).toEqual([{ login: 'John Doe', contributions: 1 }])
        expect(logger.info).toHaveBeenCalledWith(
            `Fetching contributors for npm package: ${packageName}`
        )
    })

    it('should fallback to maintainers if contributors are not present', async () => {
        // Arrange
        const packageName = 'express'
        const npmApiCalls = new NpmApiCalls(
            `https://www.npmjs.com/package/${packageName}`
        )
        npmApiCalls.repo = packageName

        // Mock fetch response
        const mockResponse = {
            maintainers: [{ name: 'Jane Smith', email: 'jane@example.com' }],
        }

        ;(fetch as unknown as vi.Mock).mockResolvedValue({
            json: async () => mockResponse,
        })

        // Act
        const contributors = await npmApiCalls.fetchContributors()

        // Assert
        expect(contributors).toEqual([
            { login: 'Jane Smith', contributions: 1 },
        ])
        expect(logger.info).toHaveBeenCalledWith(
            `Fetching contributors for npm package: ${packageName}`
        )
    })

    it('should return empty array if no contributors or maintainers are found', async () => {
        // Arrange
        const packageName = 'express'
        const npmApiCalls = new NpmApiCalls(
            `https://www.npmjs.com/package/${packageName}`
        )
        npmApiCalls.repo = packageName

        // Mock fetch response with no contributors or maintainers
        const mockResponse = {}

        ;(fetch as unknown as vi.Mock).mockResolvedValue({
            json: async () => mockResponse,
        })

        // Act
        const contributors = await npmApiCalls.fetchContributors()

        // Assert
        expect(contributors).toEqual([])
        expect(logger.warn).toHaveBeenCalledWith(
            'No contributors found in the package metadata.'
        )
    })

    it('should handle errors and return empty array', async () => {
        // Arrange
        const packageName = 'express'
        const npmApiCalls = new NpmApiCalls(
            `https://www.npmjs.com/package/${packageName}`
        )
        npmApiCalls.repo = packageName

        // Mock fetch to throw an error
        ;(fetch as unknown as vi.Mock).mockRejectedValue(
            new Error('Network Error')
        )

        // Act
        const contributors = await npmApiCalls.fetchContributors()

        // Assert
        expect(contributors).toEqual([])
        expect(logger.error).toHaveBeenCalledWith(
            'Error fetching contributors:',
            expect.any(Error)
        )
    })
})
