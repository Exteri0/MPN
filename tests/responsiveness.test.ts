// import { describe, it, expect, vi, beforeEach } from 'vitest'
// import { Responsiveness } from '../src/Metrics/responsiveness' // Adjust path as needed
// import { Octokit } from 'octokit'
// import ApiCalls from '../src/API/api'
// import GitHubApiCalls from '../src/API/GitHubApiCalls'
// import NpmApiCalls from '../src/API/NpmApiCalls'

// vi.mock('octokit', () => ({
//     Octokit: vi.fn(() => ({
//         request: vi.fn(),
//     })),
// }))

// describe('Responsiveness Class', () => {
//     let ResCalculator: Responsiveness
//     let apiInstance: any

//     beforeEach(async () => {
//         apiInstance = new ApiCalls(['https://github.com/nullivex/nodist'])
//         const apiObj = await apiInstance.callAPI()
//         ResCalculator = new Responsiveness(apiObj as GitHubApiCalls)
//     })

//     it('should calculate responsiveness when there are issues and comments', async () => {
//         // Mock GitHub issues response
//         vi.spyOn(ResCalculator, 'ComputeResponsivenessG')

//         const score = await ResCalculator.ComputeResponsiveness()

//         expect(score).toBeGreaterThan(0) // Example: Expect score to be calculated correctly
//     })

//     // it('should return max score if no comments or closed issues are present', async () => {
//     //     // Mock GitHub issues response with an open issue without comments
//     //     octokitMock.mockResolvedValueOnce({
//     //         data: [
//     //             {
//     //                 number: 2,
//     //                 title: 'Issue 2',
//     //                 created_at: '2023-09-20T12:00:00Z',
//     //                 closed_at: null,
//     //                 comments_url:
//     //                     'https://api.github.com/repos/owner/repo/issues/2/comments',
//     //             },
//     //         ],
//     //     })

//     //     // Mock comments response with no comments
//     //     octokitMock.mockResolvedValueOnce({
//     //         data: [],
//     //     })

//     //     const score = await responsivenessCalculator.ComputeResponsiveness()

//     //     expect(score).toBe(1) // Expect max score if no responsiveness data is available
//     // })

//     // it('should calculate responsiveness when multiple issues are present', async () => {
//     //     // Mock multiple GitHub issues response
//     //     octokitMock.mockResolvedValueOnce({
//     //         data: [
//     //             {
//     //                 number: 3,
//     //                 title: 'Issue 3',
//     //                 created_at: '2023-09-20T12:00:00Z',
//     //                 closed_at: '2023-09-22T12:00:00Z',
//     //                 comments_url:
//     //                     'https://api.github.com/repos/owner/repo/issues/3/comments',
//     //             },
//     //             {
//     //                 number: 4,
//     //                 title: 'Issue 4',
//     //                 created_at: '2023-09-21T12:00:00Z',
//     //                 closed_at: '2023-09-23T12:00:00Z',
//     //                 comments_url:
//     //                     'https://api.github.com/repos/owner/repo/issues/4/comments',
//     //             },
//     //         ],
//     //     })

//     //     // Mock comments responses for both issues
//     //     octokitMock
//     //         .mockResolvedValueOnce({
//     //             data: [
//     //                 {
//     //                     created_at: '2023-09-21T12:00:00Z',
//     //                 },
//     //             ],
//     //         })
//     //         .mockResolvedValueOnce({
//     //             data: [
//     //                 {
//     //                     created_at: '2023-09-22T12:00:00Z',
//     //                 },
//     //             ],
//     //         })

//     //     const score = await responsivenessCalculator.ComputeResponsiveness()

//     //     expect(score).toBeLessThan(1) // Example: Expect a valid responsiveness score
//     //     expect(octokitMock).toHaveBeenCalledTimes(3) // 1 for issues, 2 for comments
//     // })

//     // it('should handle errors in API requests gracefully', async () => {
//     //     // Mock a failed GitHub API call
//     //     octokitMock.mockRejectedValueOnce(new Error('API error'))

//     //     try {
//     //         await responsivenessCalculator.ComputeResponsiveness()
//     //     } catch (error) {
//     //         expect(error).toBeDefined()
//     //     }

//     //     expect(octokitMock).toHaveBeenCalled()
//     // })
// })
