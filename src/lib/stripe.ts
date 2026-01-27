import Stripe from 'stripe'

// Lazy initialization to avoid errors during build
let stripeClient: Stripe | null = null
function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeClient
}

// Export for direct use in webhook handler
export const stripe = {
  get client() {
    return getStripe()
  },
  webhooks: {
    constructEvent: (
      payload: string | Buffer,
      signature: string,
      secret: string
    ) => getStripe().webhooks.constructEvent(payload, signature, secret),
  },
}

export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await getStripe().checkout.sessions.create({
    customer_email: userEmail,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId,
      },
    },
    metadata: {
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscriptionStatus(subscriptionId: string) {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  return subscription
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
  return subscription
}
