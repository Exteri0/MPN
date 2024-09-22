// import { contains } from '../utils'
// import Metrics from './Metrics'

// export default class License extends Metrics {
//     license: string

//     constructor(license: string) {
//         super()
//         this.license = license
//     }

//     isLicenseCompatible(): boolean | string {
//         const normalizedLicense = this.license
//             ? this.license.replace(/-or-later$/, '')
//             : 'none'

//         if (contains(this.compatibleLicenses, normalizedLicense) != -1) {
//             console.log(`Compatible license: ${normalizedLicense}`)
//             return true
//         } else if (
//             contains(this.incompatibleLicenses, normalizedLicense) != -1
//         ) {
//             console.log(`Incompatible license: ${normalizedLicense}`)
//             return false
//         } else {
//             console.log(`Unknown license: ${normalizedLicense}`)
//             return false
//         }
//     }
// }
