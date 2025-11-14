const REQUIRED_ENV_VARS = [
  'INTERNAL_API_KEY',
  'JWT_SECRET',
  'USER_SERVICE_URL',
];


export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  console.log('all environment variables validated');
}


export const config = {
  internalApiKey: process.env.INTERNAL_API_KEY as string,
  jwtSecret: process.env.JWT_SECRET as string,
  userServiceUrl: process.env.USER_SERVICE_URL as string,
};