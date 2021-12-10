function authMiddleware(req, res, next) {
    var authHeader = req.headers.authorization;
    console.log(authHeader);
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
    console.log(process.env.IPC_API_TOKEN);

    if (token !== process.env.IPC_API_TOKEN) {
        res.status(401).send('Access denied. Invalid token.');
        return;
    }

    console.log('User authenticated.');
    next();
}

module.exports = authMiddleware;