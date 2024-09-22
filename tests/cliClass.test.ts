import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CLI } from '../src/cliClass.js';
import * as fs from 'fs';
import * as readline from 'readline';

// mocks node.js modules necessary to run
vi.mock('fs');
vi.mock('readline');

// mock process.argv and process.exit before running the tests
beforeEach(() => {
    // mock process.argv to simulate command-line arguments
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cliClass.ts', 'sampleURLFile.txt']);
  
    // create a spy for process.exit that doesn't exit the process
    vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit was called');
    }) as any);
});
  
describe('CLI Class', () => {
    const sampleURLs = [
        'https://github.com/cloudinary/cloudinary_npm',
        'https://www.npmjs.com/package/express',
        'https://github.com/nullivex/nodist',
        'https://github.com/lodash/lodash',
        'https://www.npmjs.com/package/browserify',
    ];

    let cli: CLI;

    beforeEach(() => {
        cli = new CLI('sampleURLFile.txt');
    });

    // mock readline to handle async iteration
    function mockReadlineInterface(urls: string[]) {
        return {
            [Symbol.asyncIterator]: async function* () {
                for (const url of urls) {
                    yield url;  // simulate async iterable for URLs
                }
            },
            on: vi.fn(),
            close: vi.fn(),
        };
    }

    //Test 1: CLI object is initialized with the correct file path 
    it('should initialize with the correct file path', () => {
        expect(cli).toBeInstanceOf(CLI);
        expect((cli as any).inputFilePath).toBe('sampleURLFile.txt');
    });

    //Test 2: CLI prints the file path correctly
    it('should print the file path', () => {
        const consoleSpy = vi.spyOn(console, 'log');
        cli.printPath();
        expect(consoleSpy).toHaveBeenCalledWith('sampleURLFile.txt');
    });

    //Test 3: mock the reading from a file and storing the URLs
    it('should read URLs from the file and store them', async () => {
        const mockReadStream = {
            on: vi.fn((event, callback) => {
                if (event === 'data') {
                    sampleURLs.forEach(url => callback(url));
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        (fs.createReadStream as any).mockReturnValue(mockReadStream);

        //properly mock readline.createInterface to be async iterable
        (readline.createInterface as any).mockReturnValue(mockReadlineInterface(sampleURLs));

        await cli.startReadingFile();
        const storedURLs = await cli.getURLList();
        expect(storedURLs).toEqual(sampleURLs);
    });

    //Test 4: check the correct printing of the URLs
    it('should print all stored URLs correctly', async () => {
        const consoleSpy = vi.spyOn(console, 'log');
        const mockReadStream = {
            on: vi.fn((event, callback) => {
                if (event === 'data') {
                    sampleURLs.forEach(url => callback(url));
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        (fs.createReadStream as any).mockReturnValue(mockReadStream);
        (readline.createInterface as any).mockReturnValue(mockReadlineInterface(sampleURLs));

        await cli.startReadingFile();
        await cli.printURLs();

        sampleURLs.forEach(url => {
            expect(consoleSpy).toHaveBeenCalledWith(`Current URL = ${url}`);
        });
    });

    //Test 5: empty or invalid URLs
    it('should handle an empty URL gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error');
        const mockReadStream = {
            on: vi.fn((event, callback) => {
                if (event === 'data') {
                    callback('');  // Simulate empty line
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        (fs.createReadStream as any).mockReturnValue(mockReadStream);
        (readline.createInterface as any).mockReturnValue(mockReadlineInterface([''])); // Mock empty line

        await cli.startReadingFile();
        expect(consoleSpy).toHaveBeenCalledWith("This aint the url chief");
    });

    //Test 6: verify URL list retrieval
    it('should return the correct list of URLs', async () => {
        const mockReadStream = {
            on: vi.fn((event, callback) => {
                if (event === 'data') {
                    sampleURLs.forEach(url => callback(url));
                }
                if (event === 'end') {
                    callback();
                }
            }),
        };
        (fs.createReadStream as any).mockReturnValue(mockReadStream);
        (readline.createInterface as any).mockReturnValue(mockReadlineInterface(sampleURLs));

        await cli.startReadingFile();
        const urls = await cli.getURLList();
        expect(urls).toEqual(sampleURLs);
    });
});
