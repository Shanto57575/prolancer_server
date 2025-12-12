import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  BCRYPT_SALT_ROUNDS: number;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  PUSHER_CLUSTER: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredVariables: string[] = [
    "PORT",
    "NODE_ENV",
    "FRONTEND_URL",
    "DATABASE_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "BCRYPT_SALT_ROUNDS",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRES",
    "PUSHER_APP_ID",
    "PUSHER_KEY",
    "PUSHER_SECRET",
    "PUSHER_CLUSTER",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`${variable} env variable is missing`);
    }
  });

  return {
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES as string,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID as string,
    PUSHER_KEY: process.env.PUSHER_KEY as string,
    PUSHER_SECRET: process.env.PUSHER_SECRET as string,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER as string,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  };
};

export const envConfig = loadEnvVariables();
