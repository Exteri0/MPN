# MPN

Package Resgistry Project for ECE 461

Names:
Myron Tadros
Omar Faramawy
Akshata Manjunatha
Mohamed Abdelmouty

## Usage

First and foremost run "./run install" to install all the required dependencies.

```bash
./run install
```

CURRENT GUIDE FOR EXECUTION, CHANGED LATER I PROMISE.
At the root directory, "./run install" to download the dependencies locally (the blablalba intentionally doesn't exist for testing purposes), ./run environment/sampleurlfile.txt (case insensitive woohoo) to run my cliClass which will print the list of urls after STORING THEM in the CLIObject.

Second, you need to put your github token inside the ".env" file. If you don't have an env file then put your token inside the ".env.example" file and then rename it to ".env"

## Development

This project is written in typescript. You have to transpile the typescript files first and then run the built javascript files.

To transpile the typescript files, run "tsc"

```bash
tsc
```

This transpiles your typescript files and builds it into javascript code inside a build directory that can be later be deployed on the cloud.

After that, you can run the javacsript file that tsc has transpiled to you. We still don't have an "index.js" to run it each time, so you'll have to type in the javascript file that you want

```bash
node build/<your_js_file>
```

### API

Until now, the code for the api is written in the apiTemp file inside src/API folder.

In order to run it, first make sure that you have the token ready inside the ".env" file.

Then, run tsc which transpiles the whole typescript code and builds the javascript code. After building it, run the javascript file.

```bash
tsc
node build/API/apiTemp
```
