import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class NormalizeEmailPipe implements PipeTransform {
  transform(value: any) {
    if (value.email) {
      value.email = value.email.trim().toLowerCase();
    }
    return value;
  }
}
