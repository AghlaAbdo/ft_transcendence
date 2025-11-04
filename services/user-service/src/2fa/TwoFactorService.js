import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function generateSecret(userId, email) {
  const secret = speakeasy.generateSecret({
    name: `ft_pong (${email})`,
    issuer: 'ft_pong',
    length: 32,
  });

  const qrCode = QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
    manualEntryKey: secret.base32,
  };
}

export function verifyToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}