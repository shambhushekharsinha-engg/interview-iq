import mongoose from "mongoose";

/**
 * Connects the server to the MongoDB database using Mongoose.
 */
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DataBase Connected")
    } catch (error) {
        console.log(`DataBase Error ${error}`)
    }
}

export default connectDb