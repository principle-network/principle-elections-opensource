import { prop, Typegoose, arrayProp } from 'typegoose';
import {
  IsDefined,
  IsEmail,
} from 'class-validator';

export enum UserRole {
  USER = 'USER'
}

export class User extends Typegoose {

  _id: string;

  @IsDefined()
  @IsEmail()
  @prop()
  email: string;

  @prop({ enum: UserRole, default: UserRole.USER })
  type: UserRole;

  @prop()
  token: string;

  @prop()
  voteToken: string;

  @arrayProp({ items: String })
  walletAddress: string[];

  @prop({ default: false })
  walletVerified: boolean;

  @prop({ default: false })
  wasReset: boolean;

  @prop({ default: false })
  voted: boolean;

}

export class Phone extends Typegoose {

  _id: string;

  @prop()
  phoneNumber: string;

}

export class Email extends Typegoose {

  _id: string;

  @prop()
  email: string;

}

new User().getModelForClass(User);