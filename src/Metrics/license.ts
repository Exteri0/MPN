import fs from 'fs-extra'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node/index.js'
import logger from '../logger.js'
import { compatibleLicenses, incompatibleLicenses } from '../utils.js'

import { contains } from '../utils'
import Metrics from './Metrics'

export default class License extends Metrics {
    async isLicenseCompatible(): Promise<boolean | string> {
        const license = (
            await (this.apiCall.handleAPI() as Promise<{ license: string }>)
        ).license
        const normalizedLicense = license
            ? license.replace(/-or-later$/, '')
            : 'none'

        if (contains(compatibleLicenses, normalizedLicense) != -1) {
            console.log(`Compatible license: ${normalizedLicense}`)
            return true
        } else if (contains(incompatibleLicenses, normalizedLicense) != -1) {
            console.log(`Incompatible license: ${normalizedLicense}`)
            return false
        } else {
            console.log(`Unknown license: ${normalizedLicense}`)
            return false
        }
    }
}
logger.info(
    "didn't find the license through github api, attempting to clone and analyze it"
)
const dir = './tmp'
async function removeDirectoryIfExists(dir: string) {
    try {
        await fs.rm(dir, { recursive: true })
        logger.info(`Directory '${dir}' was removed.`)
    } catch (err) {
        logger.error('Error while removing directory:', err)
    }
}

await removeDirectoryIfExists(dir)
logger.info('Cloning the repository')
git.clone({
    fs,
    http,
    dir,
    url: 'https://github.com/badges/shields',
    depth: 1,
}).then(() => {
    logger.info('clone done')
    checkReadmeFile(dir, compatibleLicenses)
})

async function checkLicenseFile(
    dir: string,
    compatibleLicenses: string[]
): Promise<boolean> {
    const licenseFilePath = `${dir}/LICENSE`
    try {
        const licenseFileExists = await fs.pathExists(licenseFilePath)
        if (!licenseFileExists) {
            logger.info('LICENSE file not found.')
            return false
        }

        const licenseContent = await fs.readFile(licenseFilePath, 'utf-8')
        for (const license of compatibleLicenses) {
            if (licenseContent.includes(license)) {
                logger.info(`Found compatible license: ${license}`)
                return true
            }
        }

        logger.info('No compatible license found in LICENSE file.')
        return false
    } catch (err) {
        logger.error('Error while checking LICENSE file:', err)
        return false
    }
}

// checkLicenseFile(dir, compatibleLicenses).then((isCompatible) => {
//     if (isCompatible) {
//         logger.info('The repository has a compatible license.')
//     } else {
//         logger.info('The repository does not have a compatible license.')
//     }
// })
async function checkReadmeFile(
    dir: string,
    compatibleLicenses: string[]
): Promise<boolean> {
    const readmeFilePath = `${dir}/README.md`
    try {
        const readmeFileExists = await fs.pathExists(readmeFilePath)
        if (!readmeFileExists) {
            logger.info('README.md file not found.')
            return false
        }

        const readmeContent = await fs.readFile(readmeFilePath, 'utf-8')
        const licenseSectionIndex = readmeContent.indexOf('## License')
        if (licenseSectionIndex === -1) {
            logger.info('No "## License" section found in README.md.')
            return false
        }

        const licenseText = readmeContent
            .substring(licenseSectionIndex + '## License'.length)
            .trim()
            .split('\n')[0]
            .trim()

        for (const license of compatibleLicenses) {
            if (licenseText.includes(license)) {
                logger.info(`Found compatible license in README.md: ${license}`)
                return true
            }
        }

        logger.info('No compatible license found in README.md.')
        return false
    } catch (err) {
        logger.error('Error while checking README.md file:', err)
        return false
    }
}

// checkReadmeFile(dir, compatibleLicenses).then((isCompatible) => {
//     if (isCompatible) {
//         logger.info('The repository has a compatible license in README.md.')
//     } else {
//         logger.info('The repository does not have a compatible license in README.md.')
//     }
// })
