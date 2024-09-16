import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
/*

    * This code is a template for analyzing a package from a given URL, performing static analysis, it will be transformed to OOP to fit with the project later
    * This script analyzes a package from a given URL, performs static analysis,
    * and logs the results to a specified log file.
    * The analysis includes:
    *  - Cloning or downloading the package
    * - Running ESLint for linting
    * - Running TypeScript type checking
    * - Running npm audit for security vulnerabilities
    * - Calculating a final correctness score based on the results of the analysis

*/

// Create a log stream for all output except the final score
let logStream: fs.WriteStream;

// Function to log output to the log file
function logOutput(output: string) {
    logStream.write(output + '\n');
}

// Clone or download the package, perform static analysis, and clean up afterward
async function analyzePackage(url: string, logFilePath: string): Promise<number> {
    logStream = fs.createWriteStream(logFilePath, { flags: 'a' });  // Open the log file

    const packageDir = await createTemporaryDirectory();

    try {
        // Step 1: Clone or download package
        logOutput(`Analyzing package from URL: ${url}`);
        if (url.includes('github.com')) {
            await cloneRepo(url, packageDir);
        } else if (url.includes('npmjs.com')) {
            await downloadNpmPackage(url, packageDir);
        } else {
            throw new Error('Invalid URL');
        }

        // Step 2: Run static analysis (eslint, tsc, npm audit)
        const sizeFactor = await calculateCodebaseSize(packageDir);
        const lintScore = await runLint(packageDir, sizeFactor);
        const typeCheckScore = await runTypeCheck(packageDir, sizeFactor);
        const auditScore = await runAudit(packageDir, sizeFactor);

        // Step 3: Calculate correctness score
        const totalScore = (lintScore + typeCheckScore + auditScore) / 3;

        return totalScore;
    } finally {
        // Step 4: Clean up temporary directory and close the log
        await deleteDirectory(packageDir);
        logStream.close();
    }
}

// Example functions for running different tools with scaling and severity weightings
async function runLint(directory: string, sizeFactor: number): Promise<number> {
    return new Promise((resolve) => {
        exec(`eslint ${directory} --format json`, (error, stdout, stderr) => {
            if (error || stderr) {
                logOutput('ESLint encountered an error.');
                return resolve(0);
            }
            const report = JSON.parse(stdout);
            let totalSeverity = 0;
            report.forEach((file: any) => {
                file.messages.forEach((message: any) => {
                    const severityWeight = message.severity === 2 ? 1.5 : 1; // Error is more severe than a warning
                    totalSeverity += severityWeight;
                });
            });

            // Normalize the score, scaled with the codebase size
            const score = Math.max(0, 1 - totalSeverity / (100 * sizeFactor)); // Example scaling factor
            logOutput(`ESLint score: ${score}`);
            resolve(score);
        });
    });
}

async function runTypeCheck(directory: string, sizeFactor: number): Promise<number> {
    return new Promise((resolve) => {
        exec(`tsc --noEmit`, { cwd: directory }, (error, stdout, stderr) => {
            if (error || stderr) {
                logOutput('TypeScript type checking found issues.');
                return resolve(0.8 * sizeFactor); // Example weight for type-checking issues
            }
            logOutput('TypeScript type checking passed.');
            resolve(1); // No type errors found
        });
    });
}

async function runAudit(directory: string, sizeFactor: number): Promise<number> {
    return new Promise((resolve) => {
        exec(`npm audit --json`, { cwd: directory }, (error, stdout, stderr) => {
            if (error || stderr) {
                logOutput('npm audit encountered an error.');
                return resolve(0); // Security vulnerabilities found
            }
            const report = JSON.parse(stdout);
            const vulnerabilities = report.metadata.vulnerabilities;
            const totalVulnerabilities = (vulnerabilities.low * 0.5) +
                                         (vulnerabilities.moderate * 1) +
                                         (vulnerabilities.high * 1.5) +
                                         (vulnerabilities.critical * 2);

            // Normalize the score, scaled with the codebase size
            const score = Math.max(0, 1 - totalVulnerabilities / (50 * sizeFactor)); // Example scaling factor
            logOutput(`npm audit score: ${score}`);
            resolve(score);
        });
    });
}

// Calculate the size of the codebase by counting lines of code and files
async function calculateCodebaseSize(directory: string): Promise<number> {
    return new Promise((resolve) => {
        exec(`find ${directory} -name '*.ts' -o -name '*.js' | xargs wc -l`, (error, stdout, stderr) => {
            if (error || stderr) {
                logOutput('Failed to calculate codebase size.');
                return resolve(1); // Default size factor in case of error
            }
            const totalLines = stdout.split('\n')
                .map(line => line.trim().split(' ')[0])
                .reduce((acc, lineCount) => acc + (parseInt(lineCount) || 0), 0);

            const sizeFactor = Math.log10(totalLines || 1); // Logarithmic scaling
            logOutput(`Codebase size factor: ${sizeFactor}`);
            resolve(sizeFactor);
        });
    });
}

// Simulate downloading an npm package
async function downloadNpmPackage(url: string, directory: string): Promise<void> {
    const packageName = extractPackageNameFromNpmUrl(url);
    exec(`npm pack ${packageName}`, (error, stdout, stderr) => {
        if (error) {
            logOutput('Failed to download npm package.');
            throw new Error('Failed to download npm package');
        }
        logOutput(`Downloaded npm package: ${packageName}`);
    });
}

// Simulate cloning a GitHub repository
async function cloneRepo(repoUrl: string, directory: string): Promise<void> {
    exec(`git clone ${repoUrl} ${directory}`, (error, stdout, stderr) => {
        if (error) {
            logOutput('Failed to clone repository.');
            throw new Error('Failed to clone repository');
        }
        logOutput(`Cloned GitHub repository: ${repoUrl}`);
    });
}

function extractPackageNameFromNpmUrl(url: string): string {
    // Parse the URL to get the package name
    return url.split('/').pop() || '';
}

// Create a temporary directory for downloading/cloning the package
async function createTemporaryDirectory(): Promise<string> {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(os.tmpdir(), `package-analysis-${Date.now()}`);
        fs.mkdir(tempDir, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(tempDir);
        });
    });
}

// Delete the temporary directory after analysis
async function deleteDirectory(directory: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.rm(directory, { recursive: true, force: true }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

// Example usage
analyzePackage('https://github.com/user/repo', '/path/to/log/file.log')
    .then(score => console.log(`Final correctness score: ${score}`))
    .catch(error => console.error(`Error: ${error.message}`));
