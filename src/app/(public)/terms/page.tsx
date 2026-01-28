export default function TermsPage() {
  return (
    <div className="py-20">
      <div className="container px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using RentalPulse, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              RentalPulse is a property management platform that helps landlords and property managers track properties, tenants, payments, leases, and maintenance. We offer both free and premium subscription tiers with varying feature sets.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              To use RentalPulse, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Premium subscriptions are billed monthly. By subscribing, you authorize us to charge your payment method on a recurring basis. You may cancel your subscription at any time, and you will retain access until the end of your billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious code or attempt to compromise security</li>
              <li>Share your account with others</li>
              <li>Interfere with other users or the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
            <p className="text-muted-foreground">
              Your use of RentalPulse is also governed by our Privacy Policy. You retain ownership of all data you enter into RentalPulse. We will not share your data with third parties except as described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              RentalPulse is provided as is without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. We will notify you of significant changes via email or through the service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms of Service, please contact us at support@rentpulse.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
