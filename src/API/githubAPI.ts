// import ApiCalls from './apiCalls'

// class GithubAPI extends ApiCalls {
//     inputCommand: string
//     outputError: boolean

//     constructor(command: string, url: string) {
//         super(url)
//         this.inputCommand = command
//         this.outputError = false
//     }

//     // Connect to the GitHub API
//     connect(apiEndpoint: string): boolean {
//         this.inputURL = `${this.urlTarget}/${apiEndpoint}`
//         this.callAPI(this.inputURL)
//         return !this.checkConnectionError()
//     }

//     // Invoke specific request based on the command
//     invokeRequest(command: string): JSON {
//         console.log(`Executing GitHub API command: ${command}`)
//         // Simulated response
//         return JSON.parse('{"data": "Sample GitHub API Response"}')
//     }

//     // Check if there was an error during the connection
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

// export default GithubAPI
