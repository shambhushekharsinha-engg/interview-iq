import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Access token is missing" })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        
        if (!verifyToken || !verifyToken.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid access token" })
        }

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token has expired" })
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized: Invalid token format" })
        }
        return res.status(500).json({ message: `Internal Server Error: Authentication failed: ${error.message}` })
    }
}

export default isAuth