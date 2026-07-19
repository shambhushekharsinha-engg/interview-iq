import jwt from "jsonwebtoken"

/**
 * Generates a signed JWT session token for the specified user ID.
 * @param {string} userId - Mongoose user object ID
 * @returns {Promise<string>} Signed JSON Web Token string
 */
const genToken = async (userId) => {
    try {
        const token = jwt.sign({userId} , process.env.JWT_SECRET , {expiresIn:"7d"})
return token
    } catch (error) {
        console.log(error)
    }

}

export default genToken