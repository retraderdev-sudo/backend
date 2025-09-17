import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansSeeder {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async seed(): Promise<void> {
    const existingPlans = await this.planRepository.count();

    if (existingPlans > 0) {
      console.log('Plans already exist, skipping seed');
      return;
    }

    const plans = [
      {
        name: 'Basic Monthly',
        description: 'Perfect for getting started with basic trading features',
        priceId: 'price_1S7Juj4hRkLRan8xPqXtf68G',
        interval: 'month' as const,
        amount: 999, // $9.99 in cents
      },
      {
        name: 'Pro Monthly',
        description: 'Advanced features for serious traders',
        priceId: 'price_1S7Juk4hRkLRan8x5Q0PMtWj',
        interval: 'month' as const,
        amount: 1999, // $19.99 in cents
      },
      {
        name: 'Basic Yearly',
        description:
          'Perfect for getting started with basic trading features - Save 20%',
        priceId: 'price_1S7Jul4hRkLRan8xId2hJGpk',
        interval: 'year' as const,
        amount: 9599, // $95.99 in cents (20% off $9.99 * 12)
      },
      {
        name: 'Pro Yearly',
        description: 'Advanced features for serious traders - Save 20%',
        priceId: 'price_1S7Jum4hRkLRan8xUM3CGcir',
        interval: 'year' as const,
        amount: 19199, // $191.99 in cents (20% off $19.99 * 12)
      },
    ];

    for (const planData of plans) {
      const plan = this.planRepository.create(planData);
      await this.planRepository.save(plan);
    }
  }
}
