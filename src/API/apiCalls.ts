// src/API/apiCalls.ts
import { extractInfo } from '../utils.js';
import logger from '../logger.js';

export default abstract class ApiCalls {
    url: string;
    callReturnCode: number;
    owner: string;
    repo: string;

    constructor(url: string, owner?: string, repo?: string) {
        this.url = url;
        this.owner = owner ?? '';
        this.repo = repo ?? '';
        this.callReturnCode = 0;
    }

    abstract handleAPI(): Promise<any>;

    setOwner(owner: string): void {
        this.owner = owner;
    }

    setRepo(repo: string): void {
        this.repo = repo;
    }

    async checkErrors(): Promise<boolean> {
        if (this.url === '') {
            logger.error('No URL provided');
            this.callReturnCode = 404;
            return false;
        }
        if (this.owner === '' || this.repo === '') {
            logger.warn('No owner or repo provided');
            const { owner, repo } = await extractInfo(this.url);
            this.setOwner(owner);
            this.setRepo(repo);
        }
        this.callReturnCode = 200;
        return true;
    }

    async callAPI(): Promise<number | void> {
        if (!(await this.checkErrors())) {
            logger.error('Error occurred during API call');
            return;
        }
        await this.handleAPI();
        return this.callReturnCode;
    }
}
