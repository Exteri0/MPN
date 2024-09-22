import isLicenseCompatible from '../Metrics/license.js';
import ApiCalls from './apiCalls.js';

interface Contributor {
    name?: string;
    email?: string;
    contributions?: number; 
}

export default class NpmApiCalls extends ApiCalls {
    async handleAPI() {
        console.log(`Making API call to npm: ${this.repo}`);
        const res = await fetch(`https://registry.npmjs.org/${this.repo}`).then(
            (response) => response.json()
        );
        return res;

       /*  console.log({
            name: res.name,
            license: isLicenseCompatible(res.license) ? 1 : 0,
        }); */
    }

    // new method to fetch contributors (or maintainers)
    async fetchContributors(): Promise<Contributor[]> {
        try {
            console.log(`Fetching contributors for npm package: ${this.repo}`);
            const res = await fetch(`https://registry.npmjs.org/${this.repo}`).then(
                (response) => response.json()
            );

            // check if 'contributors' field exists. if not fallback to 'maintainers'
            const contributors = res.contributors || res.maintainers || [];

            if (contributors.length === 0) {
                console.log('No contributors found in the package metadata.');
                return [];
            }

            const formattedContributors = contributors.map((contributor: Contributor) => {
                return {
                    login: contributor.name || contributor.email || 'unknown',
                    contributions: 1 
                };
            });

            console.log('Fetched contributors:', formattedContributors);
            return formattedContributors;

        } catch (error) {
            console.error('Error fetching contributors:', error);
            return [];
        }
    }
}


