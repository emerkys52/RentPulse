'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calculator, DollarSign, TrendingUp, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

export default function CalculatorsPage() {
  const { data: session } = useSession()
  const isPremium = session?.user?.subscriptionStatus && ['trialing', 'active', 'granted'].includes(session.user.subscriptionStatus)

  // Late Fee Calculator State
  const [lateFeeInputs, setLateFeeInputs] = useState({
    rentAmount: '',
    dueDate: '',
    paymentDate: '',
    gracePeriod: '5',
    feeType: 'flat',
    feeAmount: '50',
    maxFee: '',
  })
  const [lateFeeResult, setLateFeeResult] = useState<{
    daysLate: number
    lateFee: number
    totalDue: number
  } | null>(null)

  // ROI Calculator State
  const [roiInputs, setRoiInputs] = useState({
    purchasePrice: '',
    downPayment: '',
    monthlyRent: '',
    monthlyExpenses: '',
    vacancyRate: '5',
    appreciationRate: '3',
  })
  const [roiResult, setRoiResult] = useState<{
    cashOnCashReturn: number
    capRate: number
    monthlyNetIncome: number
    annualNetIncome: number
    totalInvestment: number
  } | null>(null)

  const calculateLateFee = () => {
    const rentAmount = parseFloat(lateFeeInputs.rentAmount)
    const dueDate = new Date(lateFeeInputs.dueDate)
    const paymentDate = new Date(lateFeeInputs.paymentDate)
    const gracePeriod = parseInt(lateFeeInputs.gracePeriod)
    const feeAmount = parseFloat(lateFeeInputs.feeAmount)
    const maxFee = lateFeeInputs.maxFee ? parseFloat(lateFeeInputs.maxFee) : null

    if (isNaN(rentAmount) || isNaN(dueDate.getTime()) || isNaN(paymentDate.getTime())) {
      return
    }

    const daysLate = Math.max(
      0,
      Math.ceil((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) - gracePeriod
    )

    let lateFee = 0
    if (daysLate > 0) {
      if (lateFeeInputs.feeType === 'flat') {
        lateFee = feeAmount
      } else {
        lateFee = (rentAmount * feeAmount) / 100
      }

      if (maxFee !== null && lateFee > maxFee) {
        lateFee = maxFee
      }
    }

    setLateFeeResult({
      daysLate,
      lateFee,
      totalDue: rentAmount + lateFee,
    })
  }

  const calculateROI = () => {
    const purchasePrice = parseFloat(roiInputs.purchasePrice)
    const downPayment = parseFloat(roiInputs.downPayment)
    const monthlyRent = parseFloat(roiInputs.monthlyRent)
    const monthlyExpenses = parseFloat(roiInputs.monthlyExpenses)
    const vacancyRate = parseFloat(roiInputs.vacancyRate) / 100

    if (isNaN(purchasePrice) || isNaN(downPayment) || isNaN(monthlyRent) || isNaN(monthlyExpenses)) {
      return
    }

    const effectiveRent = monthlyRent * (1 - vacancyRate)
    const monthlyNetIncome = effectiveRent - monthlyExpenses
    const annualNetIncome = monthlyNetIncome * 12

    const totalInvestment = downPayment
    const cashOnCashReturn = (annualNetIncome / totalInvestment) * 100
    const capRate = (annualNetIncome / purchasePrice) * 100

    setRoiResult({
      cashOnCashReturn,
      capRate,
      monthlyNetIncome,
      annualNetIncome,
      totalInvestment,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calculators</h1>
        <p className="text-muted-foreground">Financial tools for property management</p>
      </div>

      <Tabs defaultValue="late-fee">
        <TabsList>
          <TabsTrigger value="late-fee">Late Fee Calculator</TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="late-fee" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Late Fee Calculator</CardTitle>
                </div>
                <CardDescription>Calculate late fees based on your rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Monthly Rent Amount</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    placeholder="1500"
                    value={lateFeeInputs.rentAmount}
                    onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, rentAmount: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={lateFeeInputs.dueDate}
                      onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={lateFeeInputs.paymentDate}
                      onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, paymentDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={lateFeeInputs.gracePeriod}
                    onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, gracePeriod: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee Type</Label>
                    <Select
                      value={lateFeeInputs.feeType}
                      onValueChange={(value) => setLateFeeInputs({ ...lateFeeInputs, feeType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat Fee</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feeAmount">
                      Fee Amount {lateFeeInputs.feeType === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="feeAmount"
                      type="number"
                      value={lateFeeInputs.feeAmount}
                      onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, feeAmount: e.target.value })}
                    />
                  </div>
                </div>

                {isPremium && (
                  <div className="space-y-2">
                    <Label htmlFor="maxFee">Maximum Fee Cap (optional)</Label>
                    <Input
                      id="maxFee"
                      type="number"
                      placeholder="No cap"
                      value={lateFeeInputs.maxFee}
                      onChange={(e) => setLateFeeInputs({ ...lateFeeInputs, maxFee: e.target.value })}
                    />
                  </div>
                )}

                {!isPremium && (
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">Upgrade to Premium for fee caps and more options</span>
                  </div>
                )}

                <Button onClick={calculateLateFee} className="w-full">
                  Calculate Late Fee
                </Button>
              </CardContent>
            </Card>

            {lateFeeResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Days Late</p>
                      <p className="text-2xl font-bold">{lateFeeResult.daysLate}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Late Fee</p>
                      <p className="text-2xl font-bold text-warning">
                        {formatCurrency(lateFeeResult.lateFee)}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Amount Due</p>
                    <p className="text-4xl font-bold text-primary">
                      {formatCurrency(lateFeeResult.totalDue)}
                    </p>
                  </div>

                  {lateFeeResult.daysLate === 0 && (
                    <div className="p-4 rounded-lg bg-success/10 text-center">
                      <p className="text-success font-medium">Payment is within grace period!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>ROI Calculator</CardTitle>
                  {!isPremium && <Badge variant="secondary">Basic</Badge>}
                </div>
                <CardDescription>Calculate return on investment for a property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="250000"
                    value={roiInputs.purchasePrice}
                    onChange={(e) => setRoiInputs({ ...roiInputs, purchasePrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment / Total Investment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    placeholder="50000"
                    value={roiInputs.downPayment}
                    onChange={(e) => setRoiInputs({ ...roiInputs, downPayment: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Monthly Rent Income</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="2000"
                    value={roiInputs.monthlyRent}
                    onChange={(e) => setRoiInputs({ ...roiInputs, monthlyRent: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    placeholder="500"
                    value={roiInputs.monthlyExpenses}
                    onChange={(e) => setRoiInputs({ ...roiInputs, monthlyExpenses: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include mortgage, taxes, insurance, maintenance, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vacancyRate">Expected Vacancy Rate (%)</Label>
                  <Input
                    id="vacancyRate"
                    type="number"
                    value={roiInputs.vacancyRate}
                    onChange={(e) => setRoiInputs({ ...roiInputs, vacancyRate: e.target.value })}
                  />
                </div>

                {!isPremium && (
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">
                      <Link href="/settings/subscription" className="text-primary hover:underline">Upgrade to Premium</Link>
                      {' '}for multi-property ROI analysis
                    </span>
                  </div>
                )}

                <Button onClick={calculateROI} className="w-full">
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {roiResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Cash-on-Cash Return</p>
                      <p className="text-2xl font-bold text-primary">
                        {roiResult.cashOnCashReturn.toFixed(2)}%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                      <p className="text-2xl font-bold">{roiResult.capRate.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Monthly Net Income</span>
                      <span className="font-semibold text-success">
                        {formatCurrency(roiResult.monthlyNetIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Annual Net Income</span>
                      <span className="font-semibold text-success">
                        {formatCurrency(roiResult.annualNetIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">Total Investment</span>
                      <span className="font-semibold">
                        {formatCurrency(roiResult.totalInvestment)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      {roiResult.cashOnCashReturn >= 8 ? (
                        <span className="text-success">Good investment - above 8% cash-on-cash return.</span>
                      ) : roiResult.cashOnCashReturn >= 5 ? (
                        <span className="text-warning">Moderate return - consider negotiating a better price.</span>
                      ) : (
                        <span className="text-destructive">Low return - may want to reconsider this investment.</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
