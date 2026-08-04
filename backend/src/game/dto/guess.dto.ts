import { IsString, Length } from 'class-validator';

export class GuessDto {
  @IsString()
  @Length(2, 32)
  value!: string;
}
