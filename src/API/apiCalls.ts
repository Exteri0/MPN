import { extractInfo } from './utils.js'

export default abstract class ApiCalls {
    url: string
    callReturnCode: number
    owner: string
    repo: string

    constructor(url: string, owner?: string, repo?: string) {
        this.url = url
        this.owner = owner ?? ''
        this.repo = repo ?? ''
        this.callReturnCode = 0
    }

    abstract handleAPI(): Promise<any>

    setOwner(owner: string): void {
        this.owner = owner
    }

    setRepo(repo: string): void {
        this.repo = repo
    }

    async checkErrors(): Promise<boolean> {
        if (this.url === '') {
            console.log('No URL providedd')
            this.callReturnCode = 404
            return false
        }
        if (this.owner === '' || this.repo === '') {
            console.log('No owner or repo provided')
            const { owner, repo } = await extractInfo(this.url)
            this.setOwner(owner)
            this.setRepo(repo)
        }
        this.callReturnCode = 200
        return true
    }

    async callAPI(): Promise<number | void> {
        if (!(await this.checkErrors())) {
            console.log('Error occurred during API call')
            return
        }
        await this.handleAPI()
        return this.callReturnCode
    }
}
