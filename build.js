const config = require(`${__dirname}/conf`);

const path = require("path");
const {
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
    mkdirSync,
    rmdirSync,
    existsSync,
} = require("fs");

let files = [];

function ThroughDirectory(directory) {
    readdirSync(directory).forEach((File) => {
        const absolute = path.join(directory, File);

        if (statSync(absolute).isDirectory()) return ThroughDirectory(absolute);
        else return files.push(absolute);
    });
}

for (const buildFolder of config.build.folders) {
    ThroughDirectory(buildFolder);
}

if (existsSync(`build`)) rmdirSync(`build`, { recursive: true, force: true });
mkdirSync(`build`);

switch (config.build.folders.length) {
    case 0:
        console.info(`\x1B[33m[build] no folder to build\x1B[39m`);
        break;
    case 1:
        console.info(`\x1B[33m[build] building 1 folder...\x1B[39m`);
        break;
    default:
        console.info(
            `\x1B[33m[build] building ${config.build.folders.length} folders...\x1B[39m`
        );
        break;
}

for (const file of files) {
    let content = readFileSync(file).toString();
    let contentByLine = content.split("\n");
    let newContentByLine = [];

    for (const line of contentByLine) {
        newContentByLine.push(line.slice(line.search(/\S|$/)));
    }

    let newContent = "";

    for (let line = 0; line < newContentByLine.length; line++) {
        if (newContentByLine[line] === "") continue;

        if (newContentByLine[line].slice(-1) === "\r") {
            newContentByLine[line] = newContentByLine[line].slice(
                0,
                newContentByLine[line].length - 1
            );

            for (const exception of config.build.exceptions) {
                if (
                    file.substring(
                        file.length - exception.fileExtension.length
                    ) !== exception.fileExtension
                )
                    continue;
                if (
                    exception.characters.includes(
                        newContentByLine[line].slice(-1)
                    )
                )
                    continue;
                newContentByLine[line] += " ";
            }
        }

        newContent += newContentByLine[line];
    }

    let fileFolders = file.split("/");

    fileFolders.pop();
    fileFolders = fileFolders.join("/");

    mkdirSync(`${__dirname}/build/${fileFolders}`, { recursive: true });
    writeFileSync(`${__dirname}/build/${file}`, newContent);
}

switch (config.build.folders.length) {
    case 1:
        console.info(`\x1B[32m[build] builded 1 folder with success!\x1B[39m`);
        break;
    default:
        console.info(
            `\x1B[32m[build] builded ${config.build.folders.length} folders with success!\x1B[39m`
        );
        break;
}
