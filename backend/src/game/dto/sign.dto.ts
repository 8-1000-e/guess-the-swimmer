import { IsString, Length } from 'class-validator';

export class SignDto {
  @IsString()
  @Length(32, 64)
  token!: string;
}
