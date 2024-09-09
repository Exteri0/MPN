// import ApiCalls from './apiCalls'

// class NpmCommandObject extends ApiCalls {
//     inputCommandType: string
//     outputError: boolean

//     constructor(commandType: string, url: string) {
//         super(url)
//         this.inputCommandType = commandType
//         this.outputError = false
//     }

//     connect(npmEndpoint: string): boolean {
//         this.inputURL = `${this.urlTarget}/${npmEndpoint}`
//         this.callAPI(this.inputURL)
//         return !this.checkConnectionError()
//     }

//     invokeRequest(command: string): JSON {
//         console.log(`Executing npm API command: ${command}`)

//         return JSON.parse('{"data": "Sample npm API Response"}')
//     }

//     checkConnectionError(): number {
//         if (this.checkErrors()) {
//             this.outputError = true
//             return 1
//         } else {
//             this.outputError = false
//             return 0
//         }
//     }
// }
