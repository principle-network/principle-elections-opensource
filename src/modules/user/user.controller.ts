import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { VPhone, VRegister } from './user.validation';
import { UserService } from './user.service';
import { Email, Phone, User } from './user.entity';
import { UserNotFoundException } from './exceptions/userNotFound.exception';
import { PhoneExists, PhonePrefixNotSupported } from './exceptions/phone.exception';
import * as crypto from 'crypto';
import { Recaptcha } from 'express-recaptcha';

@Controller()
export class UserController {

  constructor(private userService: UserService) {

  }

  @Post('/api/v1/wallet/:address/vote/:voteToken/init')
  async initializeWallet(@Param('voteToken') token, @Param('address') address) {

    const UserModel = new User().getModelForClass(User);
    const user = await UserModel.findOne({ voteToken: token });

    if (!user) throw new UserNotFoundException();

    if(user.walletAddress) {
      user.walletAddress.push(address);
    } else {
      user.walletAddress = [address];
    }

    await user.save();

    let result = await this.userService.initUserWallet(address, token);

    if(!user.walletVerified) {
      user.walletVerified = true;

      await user.save();
    }
    return user;
  }

  @Get('/voli/:voteToken')
  async voteView(@Res() res, @Param('voteToken') voteToken): Promise<any> {

    const UserModel = new User().getModelForClass(User);
    const user = await UserModel.findOne({ voteToken });
    if (!user) return res.redirect('/');

    res.render('vote/index', { voteToken, voted: !!user.voted });
  }

  @Get('/registracija')
  async registerView(@Res() res): Promise<any> {
    res.render('register/index');
  }

  @Get('potrdi/:token')
  async confirmEmailView(@Res() res, @Param('token') token): Promise<any> {
    const UserModel = new User().getModelForClass(User);
    const user = await UserModel.findOne({ token });

    if (!user) return res.redirect('/');
    res.render('confirm/index', { data: { token } });
  }

  @Post('api/v1/confirm/phone/:token')
  async confirmPhone(@Res() res, @Req() req, @Param('token') token, @Body() data: VPhone): Promise<any> {

    const UserModel = new User().getModelForClass(User);
    const PhoneModel = new Phone().getModelForClass(Phone);
    const legalPrefixes = ['030', '040', '068', '069', '031', '041', '051', '071', '065', '070', '064', '065'];

    const user = await UserModel.findOne({ token });
    if (!user) throw new UserNotFoundException();

    let phoneNumber = data.phone;
    const prefix = phoneNumber.substring(0, 3);
    const prefixMatches = legalPrefixes.filter((p) => p === prefix);
    if (!prefixMatches.length) {
      throw new PhonePrefixNotSupported(phoneNumber);
    }

    const oldPhoneFormat = '00386' + phoneNumber.substring(1);

    phoneNumber = '386' + phoneNumber.substring(1);

    const phoneDoc = await PhoneModel.findOne({ $or: [{ phoneNumber: phoneNumber }, { phoneNumber: oldPhoneFormat }] });
    if (phoneDoc) throw new PhoneExists(phoneNumber);

    const phone = new PhoneModel({ phoneNumber });
    await phone.save();

    const EmailModel = new Email().getModelForClass(Email);
    const emailDoc = new EmailModel({ email: user.email });
    await emailDoc.save();

    user.email = null;
    user.token = null;
    user.voteToken = crypto.randomBytes(20).toString('hex');
    await user.save();

    await this.userService.sendSMS(user.voteToken, phoneNumber);

    if (!user) throw new UserNotFoundException();

    res.send(true);

  }

  @Post('api/v1/resetUser/:token')
  async resetUser(@Body() data, @Param('token') token): Promise<any> {

    if (token !== process.env.ADMIN_TOKEN) {
      throw new UserNotFoundException();
    }

    const phoneNumber = data.phoneNumber;

    const UserModel = new User().getModelForClass(User);
    const user = new UserModel();
    user.wasReset = true;
    user.voteToken = crypto.randomBytes(20).toString('hex');
    user.save();

    await this.userService.sendSMS(user.voteToken, phoneNumber);

  }

  @Post('api/v1/register')
  async register(@Body() user: VRegister): Promise<any> {
    return await this.userService.register(user);
  }

  @Post('api/v1/vote/:voteToken')
  async vote(@Res() res, @Body() voted: Boolean, @Param('voteToken') voteToken): Promise<any> {
    const UserModel = new User().getModelForClass(User);
    const user = await UserModel.findOneAndUpdate({ voteToken }, { voted: true }, { new: true }).exec();

    res.send(user.voted);
  }

  @Post('api/v1/inviteFriends')
  async inviteFriends(@Body() body): Promise<any> {
    body.emails.forEach(email => {
      this.userService.sendEmail(email);
    });
  }

  @Get('/pogoji')
  async termsView(@Res() res): Promise<any> {
    res.render('terms/index');
  }

  @Get('/zasebnost')
  async privacyView(@Res() res): Promise<any> {
    res.render('privacy/index');
  }

  @Get('*')
  async redirect(@Res() res): Promise<any> {
    res.redirect('/registracija');
  }

}
