import { Router } from "express";
import Stripe from "stripe";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/create-checkout
// Creates a Stripe Checkout session for the Developer plan
router.post("/create-checkout", requireAuth, async (req, res) => {
  const { email } = req.user;
  const { billing = "monthly" } = req.body;

  // Choose monthly or annual Stripe price
  const priceId = billing === "annual"
    ? process.env.STRIPE_DEVELOPER_ANNUAL_PRICE_ID
    : process.env.STRIPE_DEVELOPER_PRICE_ID;

  console.log("🔑 Using price ID:", priceId);
  console.log("🔑 Using Stripe key:", process.env.STRIPE_SECRET_KEY?.slice(0, 20) + "...");

  if (!priceId) {
    return res.status(500).json({ error: `Stripe price ID not configured for billing: ${billing}` });
  }

  try {
    // Get or create Stripe customer
    let customerId;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", req.user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email, metadata: { supabase_id: req.user.id } });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/settings?upgraded=true`,
      cancel_url:  `${process.env.FRONTEND_URL}/pricing`,
      metadata:    { supabase_id: req.user.id },
      subscription_data: {
        metadata: { supabase_id: req.user.id },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// POST /api/stripe/portal
// Opens Stripe Customer Portal to manage/cancel subscription
router.post("/portal", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", req.user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: "No billing account found." });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/settings`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Failed to open billing portal." });
  }
});

// POST /api/stripe/webhook
// Handles Stripe events — subscription created, updated, deleted
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session      = event.data.object;
  const supabaseId   = session.metadata?.supabase_id;

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated":
      if (supabaseId) {
        const status = session.status || session.subscription_status;
        const plan   = ["active", "trialing"].includes(status) ? "developer" : "free";
        await supabase.from("profiles").update({
          plan,
          stripe_subscription_id: session.subscription || session.id,
        }).eq("id", supabaseId);
        console.log(`✅ Plan updated to ${plan} for user ${supabaseId}`);
      }
      break;

    case "customer.subscription.deleted":
      if (supabaseId) {
        await supabase.from("profiles").update({ plan: "free", stripe_subscription_id: null }).eq("id", supabaseId);
        console.log(`⬇️  Plan downgraded to free for user ${supabaseId}`);
      }
      break;
  }

  res.json({ received: true });
});

export default router;
