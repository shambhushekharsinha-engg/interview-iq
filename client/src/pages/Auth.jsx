import React, { useState } from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Auth({ isModel = false }) {
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleGoogleAuth = async () => {
        // Prevent accidental double-submits
        if (isLoading) return;
        
        setIsLoading(true)
        setErrorMessage("")
        
        try {
            const response = await signInWithPopup(auth, provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            
            const result = await axios.post(
                `${ServerUrl}/api/auth/google`, 
                { name, email }, 
                { withCredentials: true }
            )
            
            dispatch(setUserData(result.data))
        } catch (error) {
            console.error("Authentication failed:", error)
            dispatch(setUserData(null))
            
            // Provide human-readable feedback based on the failure reason
            if (error.code === 'auth/popup-closed-by-user') {
                setErrorMessage("Sign-in popup was closed before completion. Please try again.")
            } else if (error.code === 'auth/popup-blocked') {
                setErrorMessage("Sign-in popup was blocked by your browser. Please allow popups for this site.")
            } else {
                setErrorMessage("Failed to authenticate. Please check your network connection and try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`
          w-full 
          ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}
        `}>
            <motion.div 
            initial={{ opacity: 0, y: -40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.05 }}
            className={`
            w-full 
            ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
            bg-white shadow-2xl border border-gray-200
          `}>
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18}/>
                    </div>
                    <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
                </div>

                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                    Continue with
                    <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2'>
                        <IoSparkles size={16}/>
                        AI Smart Interview
                    </span>
                </h1>

                <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-6'>
                    Sign in to start AI-powered mock interviews,
                    track your progress, and unlock detailed performance insights.
                </p>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-xs md:text-sm font-medium">
                        {errorMessage}
                    </div>
                )}

                <motion.button 
                onClick={handleGoogleAuth}
                disabled={isLoading}
                whileHover={isLoading ? {} : { opacity: 0.9, scale: 1.03 }}
                whileTap={isLoading ? {} : { opacity: 1, scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 py-3 rounded-full shadow-md text-white transition-colors
                    ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <FcGoogle size={20}/>
                            Continue with Google
                        </>
                    )}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Auth