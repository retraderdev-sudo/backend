import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating payload:', payload);
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      console.log('JWT Strategy - User not found for ID:', payload.sub);
      throw new UnauthorizedException('User not found');
    }
    console.log('JWT Strategy - User validated:', { id: user.id, email: user.email, role: user.role });
    return { id: user.id, email: user.email, role: user.role };
  }
}
