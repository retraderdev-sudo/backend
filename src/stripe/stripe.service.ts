import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly plansService: PlansService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createCheckoutSession(planId: number, email: string): Promise<string> {
    try {
      // Get the plan from database
      const plan = await this.plansService.findOne(planId);

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: {
          planId: planId.toString(),
          planName: plan.name,
        },
      });

      return session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    console.log('Checkout session completed:', session.id);
    // Here you would typically:
    // 1. Find the user by email
    // 2. Create/update their subscription record
    // 3. Mark their subscription as active
    // For now, we'll just log it
  }

  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment succeeded:', invoice.id);
    // Here you would typically:
    // 1. Find the subscription
    // 2. Update the subscription status
    // 3. Log the successful renewal
  }

  async handleCustomerSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    console.log('Customer subscription deleted:', subscription.id);
    // Here you would typically:
    // 1. Find the subscription in your database
    // 2. Mark it as canceled
    // 3. Update user access
  }
}
