const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let authHeader = req.get("Authorization")
    if (!authHeader) {
        req.isAuth = false
        return next()
    }

    const token = authHeader.split(" ")[1] // Authorization:Bearer <tokenValue>
    if (!token || token.length <= 0) {
        req.isAuth = false
        return next()
    }

    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token, "thisIsHashingKeyMustBeSecret")
    } catch (error) {
        req.isAuth = false
        return next()
    }

    if (decodedToken.length < 0) {
        req.isAuth = false
        return next()
    }

    req.isAuth = true
    req.userId = decodedToken.userId
    req.email = decodedToken.email
    next()
}