function authMiddleware(req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Access denied. No token provided.');
        return;
    }
    if (!authHeader.startsWith('Bearer ')) {
        res.status(401).send('Access denied. Invalid token.');
        return;
    }

    // Remove Bearer from string
    var token = authHeader.slice(7, authHeader.length);

    if (token !== process.env.IPC_API_TOKEN) {
        res.status(401).send('Access denied. Invalid token.');
        return;
    }

    next();
}

module.exports = authMiddleware;