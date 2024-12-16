const sendEmail = require('../utils/emailService');
// const stripe = require('../config/stripe');
const Plan = require('../models/Plan');
const dotenv = require('dotenv');
dotenv.config();

const createCheckoutSession = async (req, res) => {
    const { planId, email, userId } = req.body;
    const stripe = require('stripe')("sk_test_51QWj7GEjI2Xd2Cf0A8uMpNWjH7xOgpa0BDqcZ3KLM0C2wDX1Tvv3PCjy2W4mPbxqirFcyu50NIlpdDXjX41vSwDm00Ko9mVHTG");
    try {
        const plan = await Plan.findById(planId);
        console.log({"id":plan.stripePriceId, "plan": plan.userLimit});
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plan.stripePriceId, // Use existing Stripe price ID
                    quantity: plan.userLimit, // Set quantity to userCount
                },
            ],
            mode: 'subscription', // Change mode to 'subscription'
            success_url: `${process.env.FRONTEND_URL}/payment/success?planId=${planId}&userId=${userId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/failure`,
            customer_email: email, // Set customer email
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { createCheckoutSession };
