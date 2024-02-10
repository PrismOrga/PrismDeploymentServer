module.exports = {
    appStatus: {
        OK: 1,
        TO_KO: 83,
        KO: 84,
        UNKNOWN: -1,
        NOT_LAUNCHED: 0,
    },

    ssl: {
        bypass: false,
        certificate: "private/cert.pem",
        privateKey: "private/privkey.pem",
    },

    jwt: {
        privateKey: "private/jwtpriv.key",
    },

    build: {
        auto: true,
        folders: ["client/src"],
        exceptions: [
            {
                fileExtension: "html",
                characters: [" ", ">"],
            },
            {
                fileExtension: "css",
                characters: [" ", ";", ",", "}", "{"],
            },
            {
                fileExtension: "js",
                characters: [" ", ";", ",", '"', "'", "`", "(", "{", "}"],
            },
        ],
    },
};
