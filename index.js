require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

const app = express();

// 1️⃣ Enable CORS and handle preflight before routes
app.options('*', cors());                    
app.use(cors({ origin: 'https://prachiagg06.github.io' }));  
app.use(express.json());

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create an order route
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment route
app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated === razorpay_signature) {
    res.json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'failure' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ready at http://localhost:${PORT}`));

