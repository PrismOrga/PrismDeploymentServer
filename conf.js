module.exports = {
    appStatus: {
        OK: 1,
        KO: 84,
        UNKNOWN: -1,
        NOT_LAUNCHED: 0,
    },

    ssl: {
        certificate: "./private/cert.pem",
        privateKey: "./private/privkey.pem",
    },

    build: {
        auto: false,
        folders: ["client/src"],
        exeptions: [
            {
                fileExtension: "html",
                characters: [" ", ">"]
            },
            {
                fileExtension: "css",
                characters: [" ", ";", ",", "}", "{"]
            },
            {
                fileExtension: "js",
                characters: [" ", ";", ",", "\"", "'", "`", "(", "{", "}"]
            }
        ]
    }
};
