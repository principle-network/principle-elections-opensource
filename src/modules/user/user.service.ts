import { Component } from '@nestjs/common';
import { Email, User } from './user.entity';
import { EmailExistsException } from './exceptions/emailExists.exception';
import { VRegister } from './user.validation';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

const Web3 = require('web3');


const AWS = require('aws-sdk');

AWS.config.region = 'eu-west-1';
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // use TLS
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

@Component()
export class UserService {

  private web3: any;
  private account: any;

  constructor() {
    this.web3Init();
  }

  web3Init() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/rop'));
    this.account = this.web3.eth.accounts.privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
  }

  async initUserWallet(walletAddress: string, voteToken: string) {

    const myContract = new this.web3.eth.Contract([
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "userAddresses",
                    "type": "address[]"
                },
                {
                    "name": "userTokens",
                    "type": "bytes32[]"
                }
            ],
            "name": "addPreviouslyVerifiedAddresses",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "valueToSend",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "verified",
                    "type": "bool"
                },
                {
                    "indexed": false,
                    "name": "success",
                    "type": "bool"
                }
            ],
            "name": "VerifiedAddress",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "toggleVotingStatus",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "name": "userToken",
                    "type": "string"
                }
            ],
            "name": "verifyAddress",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "partyIndex",
                    "type": "uint256"
                }
            ],
            "name": "vote",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "constructor"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "addressToToken",
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getPartiesCount",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "partyIndex",
                    "type": "uint256"
                }
            ],
            "name": "getPartyResults",
            "outputs": [
                {
                    "name": "partyId",
                    "type": "uint256"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "voteCount",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getPartyResultsOwner",
            "outputs": [
                {
                    "name": "partyId",
                    "type": "uint256[25]"
                },
                {
                    "name": "voteCount",
                    "type": "uint256[25]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "partyList",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "source",
                    "type": "string"
                }
            ],
            "name": "stringToBytes32",
            "outputs": [
                {
                    "name": "result",
                    "type": "bytes32"
                }
            ],
            "payable": false,
            "stateMutability": "pure",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                },
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "tokenToAddresses",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "verifiedAddresses",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "votedAddresses",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "name": "votedTokens",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "votingInProgress",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]);

    const data = myContract.methods.verifyAddress(walletAddress, voteToken).encodeABI();

    const nonce = await this.web3.eth.getTransactionCount(this.account.address,"pending");

    const signedTransactionData = await this.account.signTransaction({
      to: '0x4764811870aa8c7b5b068b4ccec9f04a1aa4b05b',
      data: data,
      gas: '200000',
      value: '0',
      nonce: nonce
    });

    return new Promise((resolve, reject) => {
      this.web3.eth.sendSignedTransaction(signedTransactionData.rawTransaction, (err, result) => {
        resolve(result);
      });
    });

  }

  async register(userData: VRegister): Promise<any> {

    if (await this.getByEmail(userData.email)) throw new EmailExistsException(userData.email);
    if (await this.getByEmail2(userData.email)) throw new EmailExistsException(userData.email);

    const UserModel = new User().getModelForClass(User);
    const user = new UserModel(userData);
    user.token = crypto.randomBytes(20).toString('hex');
    user.save();

    this.sendEmail(user.email, user.token);

    return true;

  }

  async sendSMS(token, phone) {

    // Do not send sms to this number, used for testing
    if(phone === "38641000000"){
      return true;
    }

    const sns = new AWS.SNS();
    sns.setSMSAttributes({
      attributes: {
        DefaultSenderID: 'Principle',
        DefaultSMSType: 'Transactional'
      }
    });

    const params = {
      Message: `Voli tukaj med 28.5. in 1.6.: https://volitve.principle.network/voli/${token}\nEkipa Principle`,
      MessageStructure: 'string',
      PhoneNumber: phone,
      Subject: 'Principle Volitve 2018'
    };

    sns.publish(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
    });

    return true;

  }

  async sendEmail(email: string, token?: string) {

    let mailOptions = {};

    if (!token) { // Friend invite
      mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Sodeluj na prvih volitvah na blockchainu',
        html:
          `<h4>Prijava v Blockchain volitve 2018</h4>
          <p>Živjo!</p>
          <p>Povabljen si bil na prve vzporedne volitve v Državni zbor na blockchainu.</p>
          <p>Klikni na spodnjo povezavo za sodelovanje</p>
          <a href="${process.env.HOST_URL}"><b>${process.env.HOST_URL}</b></a>`
      };
    } else {
      // setup nodemailer email data with unicode symbols
      mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Potrditev identitete za blockchain volitve',
        html: `<h4>Prijava v Blockchain volitve 2018</h4><p>Klikni na spodnjo povezavo za aktivacijo</p><a href="${process.env.HOST_URL}/potrdi/${token}"><b>${process.env.HOST_URL}/potrdi/${token}</b></a>`
      };
    }

    // send mail with defined transport object
    return mailer.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  }

  async getByEmail(email: string) {

    const UserModel = new User().getModelForClass(User);
    return UserModel.findOne({ email });

  }

  async getByEmail2(email: string) {

    const EmailModel = new Email().getModelForClass(Email);
    return EmailModel.findOne({ email });

  }
}