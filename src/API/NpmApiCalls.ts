import ApiCalls from './ApiCalls'

export default class NpmApiCalls extends ApiCalls {
    async handleNpmAPI(repo: string) {
        console.log(`Making API call to npm: ${repo}`)
        const res = await fetch(`https://registry.npmjs.org/${repo}`)
        const data = await res.json()
        console.log(data.description)
    }

    async callAPI(): Promise<number | void> {
        for (let url of this.inputURL) {
            const { type, repo } = await this.extractInfo(url)
            if (type === 'npm') {
                await this.handleNpmAPI(repo)
            }
        }
        return this.callReturnCode
    }
}
