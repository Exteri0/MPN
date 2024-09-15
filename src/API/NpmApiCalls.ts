import ApiCalls from './apiCalls.js'

export default class NpmApiCalls extends ApiCalls {
    async handleAPI() {
        console.log(`Making API call to npm: ${this.repo}`)
        const res = await fetch(`https://registry.npmjs.org/${this.repo}`)
        const data = await res.json()
        console.log(data.description)
    }
}
