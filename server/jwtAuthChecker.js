module.exports = {
    authenticateJWT: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(" ")[1];

            JWT.verify(token, JWT_PRIVATE_KEY, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                if ((!user.access || !user.access.api.includes(req.route.path)) && !user.access.api.includes("*")) {
                    return res.sendStatus(403);
                }

                if (req.body.appName && (!user.access || !user.access.apps.includes(req.body.appName)) && !user.access.apps.includes("*")) {
                    return res.sendStatus(403);
                }

                req.user = user;

                next();
            });
        } else {
            return res.redirect("/login");
        }
    },
};
