import { contains } from '../utils'

export default class License {
    compatibleLicenses: string[] = [
        'Apache-2.0',
        'Artistic-2.0',
        'BSL-1.0',
        'BSD-2-Clause',
        'BSD-3-Clause',
        'BSD-3-Clause-Clear',
        '0BSD',
        'CC0-1.0',
        'ECL-2.0',
        'EPL-1.0',
        'EPL-2.0',
        'GPL-2.0',
        'GPL-3.0',
        'LGPL-2.1',
        'LGPL-3.0',
        'ISC',
        'MIT',
        'MPL-2.0',
        'PostgreSQL',
        'NCSA',
        'Unlicense',
        'Zlib',
        'none',
        'other',
    ]

    incompatibleLicenses: string[] = [
        'AFL-3.0',
        'BSD-4-Clause',
        'CC',
        'CC-BY-4.0',
        'CC-BY-SA-4.0',
        'WTFPL',
        'EUPL-1.1',
        'AGPL-3.0',
        'LPPL-1.3c',
        'MS-PL',
        'OSL-3.0',
        'OFL-1.1',
    ]
    license: string

    constructor(license: string) {
        this.license = license
    }

    isLicenseCompatible(): boolean | string {
        const normalizedLicense = this.license
            ? this.license.replace(/-or-later$/, '')
            : 'none'

        if (contains(this.compatibleLicenses, normalizedLicense) != -1) {
            console.log(`Compatible license: ${normalizedLicense}`)
            return true
        } else if (
            contains(this.incompatibleLicenses, normalizedLicense) != -1
        ) {
            console.log(`Incompatible license: ${normalizedLicense}`)
            return false
        } else {
            console.log(`Unknown license: ${normalizedLicense}`)
            return false
        }
    }
}
