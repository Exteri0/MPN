class busFactor {
    metricCode: number;
    githubApi: githubAPI;

    constructor(githubApi: githubAPI) {
        this.githubApi = githubApi;
        this.metricCode = 0;
    }

    setMetricCode(code: number): void {
        this.metricCode = code;
    }

    calcBusFactor(repoUrl: string): void {
        // This is just an example and will be refined and tested multiple times.
        const response = this.githubApi.invokeRequest(`GET /repos/${repoUrl}/contributors`);
        console.log('Bus Factor Calculated:', response);
    }

    
    checkErrors(): number {
        return this.githubApi.checkConnectionError();
    }
}
