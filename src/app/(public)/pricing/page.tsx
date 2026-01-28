import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, X, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    features: [
      { text: 'Up to 2 properties', included: true },
      { text: 'Up to 4 tenants', included: true },
      { text: 'Payment tracking', included: true },
      { text: 'Lease management', included: true },
      { text: 'Basic maintenance tracking', included: true },
      { text: 'Late fee calculator (basic)', included: true },
      { text: 'ROI calculator (1 property)', included: true },
      { text: 'Document storage', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Data export', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free',
    href: '/register',
    popular: false,
  },
  {
    name: 'Premium',
    description: 'For growing portfolios',
    price: '$4.99',
    period: 'per month',
    features: [
      { text: 'Unlimited properties', included: true },
      { text: 'Unlimited tenants', included: true },
      { text: 'Payment tracking', included: true },
      { text: 'Lease management', included: true },
      { text: 'Advanced maintenance tracking', included: true },
      { text: 'Late fee calculator (advanced)', included: true },
      { text: 'ROI calculator (all properties)', included: true },
      { text: 'Document storage', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Data export', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start 7-Day Free Trial',
    href: '/register?plan=premium',
    popular: true,
  },
]

const faqs = [
  {
    question: 'Can I try Premium before paying?',
    answer: 'Yes! All new Premium subscriptions come with a 7-day free trial. You can cancel anytime before the trial ends and you will not be charged.',
  },
  {
    question: 'What happens when I exceed Free tier limits?',
    answer: 'You will be prompted to upgrade to Premium when you try to add more than 2 properties or 4 tenants. Your existing data will not be affected.',
  },
  {
    question: 'Can I downgrade from Premium to Free?',
    answer: 'Yes, you can downgrade at any time. If you have more properties or tenants than the Free tier allows, you will need to archive or delete some before downgrading.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security practices to protect your data. Your information is never shared with third parties.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your Premium subscription at any time. You will retain access to Premium features until the end of your billing period.',
  },
]

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">Pricing</Badge>
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your portfolio grows. No hidden fees, no surprises.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-primary shadow-lg relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
