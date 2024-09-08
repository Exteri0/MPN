class apiCalls {
    urlTarget: string;
    inputURL: string;
    callReturnCode: number;

    constructor(url: string) {
        this.urlTarget = url;
        this.inputURL = '';
        this.callReturnCode = 0;
    }

    callAPI(url: string): number {
        console.log(`Making API call to: ${url}`);
        this.callReturnCode = 200; 
        return this.callReturnCode;
    }

    getURL(): string {
        return this.inputURL;
    }

    checkErrors(): boolean {
        return this.callReturnCode !== 200;
    }

    generateOutput(): string {
        if (this.checkErrors()) {
            return 'Error occurred during API call';
        } else {
            return 'API call was successful';
        }
    }
}
