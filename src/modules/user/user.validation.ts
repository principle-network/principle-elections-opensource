import { NormalizeEmail, Trim } from 'class-sanitizer';
import {
  IsDefined,
  IsString,
  Length,
  IsEmail
} from 'class-validator';

export class VUserRegister {

  @IsDefined() @IsString()
  name: string;
  @IsDefined() @IsString()
  teamName: string;
  @IsDefined() @IsString() @Length(6)
  password: string;
  @IsDefined() @IsEmail() @NormalizeEmail() @Trim()
  email: string;

}

export class VUserLogin {

  @IsDefined() @IsString()
  password: string;
  @IsDefined() @IsEmail() @NormalizeEmail() @Trim()
  email: string;

}

export class VRegister {
  @IsDefined() @IsString()
  email: string;
}

export class VPhone {
  @IsDefined() @IsString() @Length(9,9)
  phone: string;
}

export class Vvote {
  @IsDefined() @IsString()
  partyId: string;
}
