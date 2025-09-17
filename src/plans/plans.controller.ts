import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlansSeeder } from './plans.seeder';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan } from './entities/plan.entity';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly plansSeeder: PlansSeeder,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
    type: Plan,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'List of all plans', type: [Plan] })
  findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Plan found', type: Plan })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Plan> {
    return this.plansService.findOne(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample plans (Development only)' })
  @ApiResponse({ status: 201, description: 'Plans seeded successfully' })
  async seedPlans(): Promise<{ message: string }> {
    await this.plansSeeder.seed();
    return { message: 'Plans seeded successfully' };
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all plans (Development only)' })
  @ApiResponse({ status: 200, description: 'All plans cleared successfully' })
  async clearPlans(): Promise<{ message: string }> {
    await this.plansService.clearAll();
    return { message: 'All plans cleared successfully' };
  }
}
