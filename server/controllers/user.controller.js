import User from "../models/user.model.js"


/**
 * Retrieves the currently logged-in user\'s profile details.
 * @param {Object} req - Express request object containing userId
 * @param {Object} res - Express response object
 * @returns {Object} User profile details JSON response
 */
export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}