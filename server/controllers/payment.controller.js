import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;
        if (!amount || !credits) {
            return res.status(400).json({ message: "Invalid plan data" });
        }

        const options = {
            amount: amount * 100, // convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.json(order);
    } catch (error) {
        return res.status(500).json({ message: `failed to create Razorpay order ${error}` });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature 
        } = req.body;

        // 1. Validate required signature/order fields before initiating crypto logic
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required signature or order fields" });
        }

        // 2. Fetch the transaction record immediately to execute consistency checks
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status === "paid") {
            return res.json({ message: "Already processed" });
        }

        // 3. Verify amount/credits consistency where possible (Integrity Check)
        // Ensure the transaction in our database hasn't been modified or corrupted
        if (!payment.amount || !payment.credits) {
            return res.status(400).json({ message: "Invalid order data integrity check failed" });
        }

        // 4. Compute the expected HMAC signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // 5. Execute a Constant-Time Comparison to defend against side-channel timing attacks
        const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
        const receivedBuffer = Buffer.from(razorpay_signature, "utf-8");

        // Length validation is required before running timingSafeEqual to avoid internal buffer mismatches
        if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // 6. Update payment record safely now that validation has passed
        payment.status = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        // Add credits to user
        const updatedUser = await User.findByIdAndUpdate(payment.userId, {
            $inc: { credits: payment.credits }
        }, { new: true });

        return res.json({
            success: true,
            message: "Payment verified and credits added",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ message: `failed to verify Razorpay payment ${error}` });
    }
};