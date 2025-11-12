import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateSecret(userId, email) {
  const secret = speakeasy.generateSecret({
    name: `ft_pong (${email})`,
    issuer: 'ft_pong',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
    manualEntryKey: secret.base32,
  };
}

export function verifyToken(secret, token) {
  console.log('allo from verify token');
  
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2,
  });
}