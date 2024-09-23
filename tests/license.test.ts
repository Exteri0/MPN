import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import License from '../src/Metrics/license' // Adjust path as needed
import NpmApiCalls from '../src/API/NpmApiCalls'
import GitHubApiCalls from '../src/API/GitHubApiCalls'
import fs from 'fs-extra'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node/index.js'
import ApiCalls from '../src/API/api.js'
import { compatibleLicenses } from '../src/utils'

// Mock dependencies
// vi.mock('fs-extra')
// vi.mock('isomorphic-git', () => ({
//     clone: vi.fn(() => Promise.resolve()),
// }))

// vi.mock('../src/API/NpmApiCalls')
// vi.mock('../src/API/GitHubApiCalls')

describe('License Class', () => {
    let apiInstance: any
    let licenseCalculator: License

    beforeEach(async () => {
        // vi.clearAllMocks()
        const apiInstance = new ApiCalls(['https://github.com/lodash/lodash'])
        const apiObj = await apiInstance.callAPI()
        licenseCalculator = new License(
            (apiObj as GitHubApiCalls) || NpmApiCalls
        )
        await licenseCalculator.removeDirectoryIfExists('./tmp')
    })

    it('should fetch a license key from the API', async () => {
        vi.spyOn(licenseCalculator, 'getLicense')

        const license = await licenseCalculator.getLicense()

        expect(license).toBe('other')
        expect(licenseCalculator.getLicense).toHaveBeenCalled()
    })

    it('should return the correct GitHub URL from NPM response', async () => {
        vi.spyOn(licenseCalculator, 'getUrl')

        const url = await licenseCalculator.getUrl()

        expect(url).toBe('https://github.com/lodash/lodash')
        expect(licenseCalculator.getUrl).toHaveBeenCalled()
    })

    it('should check the LICENSE file and return true for compatible license', async () => {
        vi.spyOn(fs, 'pathExists')
        vi.spyOn(fs, 'readFile')

        const isCompatible = await licenseCalculator.checkLicenseFile(
            './tmp',
            compatibleLicenses
        )
        // we didnt clone the repo yet so we should expect false
        expect(isCompatible).toBe(false)
        expect(fs.pathExists).toHaveBeenCalledWith('./tmp/LICENSE')
    })

    it('should check the LICENSE file and return true for compatible license after cloning', async () => {
        vi.spyOn(fs, 'pathExists')
        vi.spyOn(fs, 'readFile')

        await licenseCalculator.cloneRepository()

        const isCompatible = await licenseCalculator.checkLicenseFile(
            './tmp',
            compatibleLicenses
        )
        // we did clone the repo this time  so we should expect true
        expect(isCompatible).toBe(true)
        expect(fs.pathExists).toHaveBeenCalledWith('./tmp/LICENSE')
    }, 60000)

    it('should return false when LICENSE file is not compatible', async () => {
        vi.spyOn(licenseCalculator, 'getLicense').mockResolvedValue('cc')

        const isCompatible = await licenseCalculator.checkLicenseAPI()

        expect(isCompatible).toBe(false)
    })
    it('should return 1 when a compatible license is found', async () => {
        vi.spyOn(licenseCalculator, 'checkReadmeFile').mockResolvedValue(true)
        vi.spyOn(licenseCalculator, 'checkLicenseFile').mockResolvedValue(false)
        vi.spyOn(licenseCalculator, 'checkLicenseAPI').mockResolvedValue(false)

        const score = await licenseCalculator.isLicenseCompatible()

        expect(score).toBe(1)
        expect(licenseCalculator.checkReadmeFile).toHaveBeenCalled()
    }, 60000)

    it('should return 0 when no compatible licenses are found', async () => {
        vi.spyOn(licenseCalculator, 'checkReadmeFile').mockResolvedValue(false)
        vi.spyOn(licenseCalculator, 'checkLicenseFile').mockResolvedValue(false)
        vi.spyOn(licenseCalculator, 'checkLicenseAPI').mockResolvedValue(false)

        const score = await licenseCalculator.isLicenseCompatible()

        expect(score).toBe(0)
        expect(licenseCalculator.checkReadmeFile).toHaveBeenCalled()
    }, 60000)

    it('should remove the tmp directory', async () => {
        vi.spyOn(fs, 'remove')
        await licenseCalculator.cloneRepository()
        await licenseCalculator.removeDirectoryIfExists('./tmp')
        const exists = await fs.pathExists('./tmp')
        expect(exists).toBe(false)
    }, 60000)
    it('should check if path exists', async () => {
        vi.spyOn(fs, 'pathExists')

        await licenseCalculator.checkReadmeFile('./tmp', compatibleLicenses)

        expect(fs.pathExists).toHaveBeenCalledWith('./tmp/README.md')
    })
})
