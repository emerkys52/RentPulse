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
  Bell,
  FileText,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
} from 'lucide-react'

const mainFeatures = [
  {
    icon: Home,
    title: 'Property Management',
    description: 'Manage all your properties from a single dashboard. Track multiple units, view occupancy rates, and monitor property performance.',
    highlights: ['Multi-property support', 'Unit tracking', 'Occupancy monitoring', 'Property details'],
  },
  {
    icon: Users,
    title: 'Tenant Management',
    description: 'Keep all tenant information organized and accessible. Track lease terms, contact info, and maintain communication history.',
    highlights: ['Tenant profiles', 'Contact information', 'Lease tracking', 'History notes'],
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Record and monitor all rent payments. Track payment history, identify late payments, and generate payment reports.',
    highlights: ['Payment recording', 'Late payment alerts', 'Payment history', 'Multiple methods'],
  },
  {
    icon: Calendar,
    title: 'Lease Management',
    description: 'Never miss a lease renewal with color-coded expiration alerts. Track lease terms and automate renewal reminders.',
    highlights: ['Expiration alerts', 'Color-coded urgency', 'Renewal tracking', 'Document storage'],
    premium: true,
  },
  {
    icon: Wrench,
    title: 'Maintenance Scheduler',
    description: 'Schedule and track maintenance tasks. Set up recurring maintenance items and never miss important property upkeep.',
    highlights: ['Task scheduling', 'Recurring items', 'Due date tracking', 'Vendor management'],
    premium: true,
  },
  {
    icon: Calculator,
    title: 'Financial Calculators',
    description: 'Calculate late fees, ROI, and other important financial metrics to make informed investment decisions.',
    highlights: ['Late fee calculator', 'ROI calculator', 'Save calculations', 'Export results'],
    premium: true,
  },
]

const additionalFeatures = [
  {
    icon: Bell,
    title: 'Email Reminders',
    description: 'Automated email notifications for lease expirations, maintenance due dates, and payment reminders.',
    premium: true,
  },
  {
    icon: FileText,
    title: 'Document Storage',
    description: 'Upload and organize lease agreements, property documents, and important files.',
    premium: true,
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Get insights into your portfolio performance with detailed analytics and exportable reports.',
    premium: true,
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and securely stored. We never share your information with third parties.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Access your property data from any device. Works great on desktop, tablet, and mobile.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Built with modern technology for speed and reliability. Your data is always available when you need it.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">Features</Badge>
          <h1 className="text-4xl font-bold mb-4">Everything You Need to Manage Properties</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            RentalPulse provides comprehensive tools for landlords and property managers of all sizes.
          </p>
        </div>

        {/* Main Features */}
        <div className="space-y-12 mb-20">
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{feature.title}</h2>
                    {feature.premium && (
                      <Badge variant="secondary" className="mt-1">Premium</Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 aspect-video flex items-center justify-center">
                  <feature.icon className="h-24 w-24 text-primary/20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">And Much More...</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      {feature.premium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of property owners who trust RentalPulse.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Start Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
