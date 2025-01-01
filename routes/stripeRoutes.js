const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Load Stripe secret key from .env
const router = express.Router();

// Route to create a payment intent
router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body; 

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: "inr", 
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send("Error creating payment intent");
  }
});

module.exports = router;
