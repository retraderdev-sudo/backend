import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PlansSeeder } from './plans.seeder';
import { Plan } from './entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [PlansService, PlansSeeder],
  exports: [PlansService, PlansSeeder],
})
export class PlansModule implements OnModuleInit {
  constructor(private readonly plansSeeder: PlansSeeder) {}

  async onModuleInit() {
    // Only seed in development environment
    if (process.env.NODE_ENV === 'development') {
      await this.plansSeeder.seed();
    }
  }
}
