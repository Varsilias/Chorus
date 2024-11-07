import * as crypto from 'crypto';
import * as dayjs from 'dayjs';

export const SECURITY_TOKEN_VALIDITY = 3;

export const hashPassword = (password: string, salt: string) => {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
};

export const comparePassword = (
  enteredPassword: string,
  salt: string,
  storePassword: string,
) => {
  return (
    crypto
      .pbkdf2Sync(enteredPassword, salt, 1000, 64, `sha512`)
      .toString(`hex`) === storePassword
  );
};
export const generateSixDigitNumber = () => {
  // Generate 4 random bytes
  const randomBytes = crypto.randomBytes(4);

  // Convert the random bytes to a 32-bit unsigned integer
  const randomInt = randomBytes.readUInt32BE(0);

  // Use bitwise AND to limit the range to 0-999999
  const sixDigitNumber = randomInt & 0x000fffff;

  // Ensure the number is always 6 digits by adding 100000 if it's less than 100000
  return sixDigitNumber < 100000 ? sixDigitNumber + 100000 : sixDigitNumber;
};

export const isSecurityTokenValid = (securityTokenRequestedAt: Date) => {
  const now = dayjs();

  if (dayjs(securityTokenRequestedAt)) {
    const timeDifference = now.diff(dayjs(securityTokenRequestedAt), 'minute'); // Difference in minutes

    if (timeDifference < SECURITY_TOKEN_VALIDITY) {
      return true;
    }
  }

  return false;
};
