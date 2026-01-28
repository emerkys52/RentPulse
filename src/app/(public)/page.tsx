import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  Wrench,
  Calculator,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Home,
    title: 'Property Management',
    description: 'Track all your properties and units in one centralized dashboard.',
  },
  {
    icon: Users,
    title: 'Tenant Tracking',
    description: 'Manage tenant information, leases, and communication history.',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Record and monitor rent payments, late fees, and payment history.',
  },
  {
    icon: Calendar,
    title: 'Lease Management',
    description: 'Track lease expirations with color-coded alerts and manage renewals.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Scheduler',
    description: 'Schedule and track maintenance tasks with recurring item support.',
  },
  {
    icon: Calculator,
    title: 'Financial Calculators',
    description: 'Calculate late fees, ROI, and other important metrics.',
  },
]

const testimonials = [
  {
    quote: 'Rent Got Done has transformed how I manage my rental properties. Everything is organized and easy to access.',
    author: 'Sarah M.',
    role: 'Property Owner, 5 units',
  },
  {
    quote: 'The lease expiration alerts alone have saved me countless headaches. Highly recommend!',
    author: 'Michael R.',
    role: 'Landlord, 12 units',
  },
  {
    quote: 'Finally, a property management tool that is simple enough to use but powerful enough to handle my needs.',
    author: 'Jennifer L.',
    role: 'Real Estate Investor',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Free tier available
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Property Management{' '}
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your rental property management. Track tenants, payments, leases, and
              maintenance all in one intuitive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Features
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Free plan includes up to 2 properties.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Manage Properties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From tenant management to maintenance scheduling, Rent Got Done provides all the tools
              landlords and property managers need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Rent Got Done?</h2>
              <div className="space-y-4">
                {[
                  'Free tier with essential features for small landlords',
                  'No complex setup - get started in minutes',
                  'Secure and private - your data stays yours',
                  'Regular updates with new features',
                  'Responsive support team',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Fast & Reliable</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <div className="bg-background rounded-xl shadow-lg p-6">
                <h3 className="font-semibold mb-4">Quick Stats Dashboard</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-success">92%</p>
                    <p className="text-sm text-muted-foreground">Occupancy</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-2xl font-bold">$15,200</p>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-warning">3</p>
                    <p className="text-sm text-muted-foreground">Expiring Leases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Property Owners</h2>
            <p className="text-muted-foreground">See what our users have to say about Rent Got Done.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Property Management?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of property owners who trust Rent Got Done to manage their rentals.
            Start for free today.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
