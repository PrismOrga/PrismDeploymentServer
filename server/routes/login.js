ROUTER.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(
        FS.readFileSync(`${SERVER_ROOTFOLDER}/data/users.json`)
    );
    const user = users.find((u) => {
        return u.username === username && u.password === password;
    });

    if (user) {
        const accessToken = JWT.sign(
            { username: user.username, access: user.access },
            JWT_PRIVATE_KEY,
            { expiresIn: "168h" }
        );

        res.json({
            accessToken,
        });
    } else {
        return res.sendStatus(401);
    }
});

ROUTER.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    return res.sendStatus(200);
});

