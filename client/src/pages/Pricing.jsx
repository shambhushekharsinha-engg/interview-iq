import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "motion/react";
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const dispatch = useDispatch()

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id)
      setError(null);

      const amount =  
      plan.id === "basic" ? 100 :
      plan.id === "pro" ? 500 : 0;

      const result = await axios.post(ServerUrl + "/api/payment/order" , {
        planId: plan.id,
        amount: amount,
        credits: plan.credits,
      },{withCredentials:true})
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,
        handler: async function (response) {
          try {
            const verifypay = await axios.post(ServerUrl + "/api/payment/verify" ,response , {withCredentials:true})
            dispatch(setUserData(verifypay.data.user))
            
            // Trigger modern success UI instead of blocking alert()
            setShowSuccess(true);
            setTimeout(() => {
              navigate("/");
            }, 2500);

          } catch (err) {
            console.error(err);
            setError("Payment verification failed. Please reach out to support if credits are missing.");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        },
        theme:{
          color: "#10b981",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || "Failed to initiate transaction. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6 relative overflow-hidden'>
      
      {/* Modern Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <FaCheckCircle className="text-3xl animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your credits have been successfully added to your account. Redirecting you home...
              </p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.3, ease: "linear" }}
                  className="bg-emerald-500 h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='max-w-6xl mx-auto mb-14 flex items-start gap-4'>
        <button onClick={() => navigate("/")} className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
          <FaArrowLeft className='text-gray-600' />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium animate-fadeIn">
          {error}
        </div>
      )}

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id

          return (
            <motion.div key={plan.id}
              whileHover={!plan.default && { scale: 1.03 }}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-8 transition-all duration-300 border 
                ${isSelected
                  ? "border-emerald-600 shadow-2xl bg-white"
                  : "border-gray-200 bg-white shadow-md"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              {plan.default && (
                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Default
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>

              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  {plan.price}
                </span>
                <p className="text-gray-500 mt-1">
                  {plan.credits} Credits
                </p>
              </div>

              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                    <span className="text-gray-700 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {!plan.default &&
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id)
                    } else {
                      handlePayment(plan)
                    }
                  }} 
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${isSelected
                    ? "bg-emerald-600 text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  {loadingPlan === plan.id
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}
                </button>
              }
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Pricing