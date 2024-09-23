import { describe, it, expect, vi, beforeEach } from 'vitest'
import Responsiveness from '../src/Metrics/responsiveness' // Adjust path as needed
import { Octokit } from 'octokit'

// Mock dependencies
vi.mock('octokit', () => ({
    Octokit: vi.fn(() => ({
        request: vi.fn(),
    })),
}))

describe('Responsiveness Class', () => {
    let responsivenessCalculator: Responsiveness
    let octokitMock: any

    beforeEach(() => {
        // Clear mocks and reset the responsiveness instance
        vi.clearAllMocks()

        // Create the Responsiveness instance
        responsivenessCalculator = new Responsiveness('ownerName', 'repoName')

        // Reference to the mocked octokit request method
        octokitMock = responsivenessCalculator.octokit.request
    })

    it('should calculate responsiveness when there are issues and comments', async () => {
        // Mock GitHub issues response
        octokitMock.mockResolvedValueOnce({
            data: [
                {
                    number: 1,
                    title: 'Issue 1',
                    created_at: '2023-09-20T12:00:00Z',
                    closed_at: '2023-09-22T12:00:00Z',
                    comments_url:
                        'https://api.github.com/repos/owner/repo/issues/1/comments',
                },
            ],
        })

        // Mock issue comments response
        octokitMock.mockResolvedValueOnce({
            data: [
                {
                    created_at: '2023-09-21T12:00:00Z',
                },
            ],
        })

        const score = await responsivenessCalculator.ComputerResponsiveness()

        expect(score).toBeGreaterThan(0) // Example: Expect score to be calculated correctly
        expect(octokitMock).toHaveBeenCalledTimes(2) // 1 for issues, 1 for comments
    })

    it('should return max score if no comments or closed issues are present', async () => {
        // Mock GitHub issues response with an open issue without comments
        octokitMock.mockResolvedValueOnce({
            data: [
                {
                    number: 2,
                    title: 'Issue 2',
                    created_at: '2023-09-20T12:00:00Z',
                    closed_at: null,
                    comments_url:
                        'https://api.github.com/repos/owner/repo/issues/2/comments',
                },
            ],
        })

        // Mock comments response with no comments
        octokitMock.mockResolvedValueOnce({
            data: [],
        })

        const score = await responsivenessCalculator.ComputerResponsiveness()

        expect(score).toBe(1) // Expect max score if no responsiveness data is available
    })

    it('should calculate responsiveness when multiple issues are present', async () => {
        // Mock multiple GitHub issues response
        octokitMock.mockResolvedValueOnce({
            data: [
                {
                    number: 3,
                    title: 'Issue 3',
                    created_at: '2023-09-20T12:00:00Z',
                    closed_at: '2023-09-22T12:00:00Z',
                    comments_url:
                        'https://api.github.com/repos/owner/repo/issues/3/comments',
                },
                {
                    number: 4,
                    title: 'Issue 4',
                    created_at: '2023-09-21T12:00:00Z',
                    closed_at: '2023-09-23T12:00:00Z',
                    comments_url:
                        'https://api.github.com/repos/owner/repo/issues/4/comments',
                },
            ],
        })

        // Mock comments responses for both issues
        octokitMock
            .mockResolvedValueOnce({
                data: [
                    {
                        created_at: '2023-09-21T12:00:00Z',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        created_at: '2023-09-22T12:00:00Z',
                    },
                ],
            })

        const score = await responsivenessCalculator.ComputerResponsiveness()

        expect(score).toBeLessThan(1) // Example: Expect a valid responsiveness score
        expect(octokitMock).toHaveBeenCalledTimes(3) // 1 for issues, 2 for comments
    })

    it('should handle errors in API requests gracefully', async () => {
        // Mock a failed GitHub API call
        octokitMock.mockRejectedValueOnce(new Error('API error'))

        try {
            await responsivenessCalculator.ComputerResponsiveness()
        } catch (error) {
            expect(error).toBeDefined()
        }

        expect(octokitMock).toHaveBeenCalled()
    })
})
