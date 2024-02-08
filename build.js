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
            `\x1B[33m[build] building ${config.build.folders.length} folder...\x1B[39m`
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

        for (const exception of config.build.exeptions) {
            if (
                file.substring(file.length - exception.fileExtension.length) !==
                exception.fileExtension
            )
                continue;

            let pass = true;

            for (const character of exception.characters) {
                if (
                    newContent.substring(
                        newContent.length - character.length
                    ) === character
                )
                    pass = false;
            }

            if (pass) newContent += " ";
        }

        newContent += newContentByLine[line];
    }

    let fileFolders = file.split("/");

    fileFolders.pop();
    fileFolders = fileFolders.join("/");

    mkdirSync(`${__dirname}/build/${fileFolders}`, { recursive: true });
    writeFileSync(`${__dirname}/build/${file}`, newContent);
}
