module.exports = {
    authenticateJWT: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(" ")[1];

            JWT.verify(token, JWT_PRIVATE_KEY, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                if (
                    (!user.access ||
                        !user.access.api.includes(req.route.path)) &&
                    !user.access.api.includes("*")
                ) {
                    return res.sendStatus(403);
                }

                if (
                    req.body.appName &&
                    (!user.access ||
                        !user.access.apps.includes(req.body.appName)) &&
                    !user.access.apps.includes("*")
                ) {
                    return res.sendStatus(403);
                }

                req.user = user;

                next();
            });
        } else {
            return res.redirect("/login");
        }
    },

    authenticateSocketJWT(socket, next) {
        if (socket.handshake.auth && socket.handshake.auth.token) {
            JWT.verify(
                socket.handshake.auth.token,
                JWT_PRIVATE_KEY,
                (err, user) => {
                    if (err) {
                        return next(new Error("Authentication error"));
                    }

                    const req = {
                        protocol:
                            socket.handshake.headers.referer.split("://")[0],
                        path: socket.handshake.headers.referer.split("://")[1],
                        host: undefined,
                        href: undefined,
                    };

                    req.host = req.path.slice(0, req.path.indexOf("/"));
                    req.href = req.path.slice(req.path.indexOf("/"));

                    if (
                        req.href !== "/" &&
                        (!user.access || !user.access.api.includes(req.href)) &&
                        !user.access.api.includes("*")
                    ) {
                        return next(new Error("Authentication error"));
                    }

                    if (
                        socket.handshake.query.appName &&
                        (!user.access ||
                            !user.access.apps.includes(
                                socket.handshake.query.appName
                            )) &&
                        !user.access.apps.includes("*")
                    ) {
                        return next(new Error("Authentication error"));
                    }
                    socket.user = user;
                    next();
                }
            );
        } else {
            return next(new Error("Authentication error"));
        }
    },
};
