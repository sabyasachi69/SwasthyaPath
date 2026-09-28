import {createHmac,randomBytes} from 'node:crypto';
export function newToken(){return randomBytes(32).toString('base64url');}
export function tokenHash(token:string){const pepper=process.env.REFERRAL_TOKEN_PEPPER;if(!pepper||pepper.length<32)throw Error('SHARING_NOT_CONFIGURED');return createHmac('sha256',pepper).update(token).digest('hex');}
