import { IsString, Length } from 'class-validator';

export class TokenDto {
  @IsString()
  @Length(10, 200)
  refresh_token!: string;
}
