import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_solt_round: Number(process.env.BCRYPT_SOLT_ROUND),
  cors_origin: process.env.CORS_ORIGIN,
  admin: {
    name: process.env.NAME,
    email: process.env.EMAIL,
    phone: process.env.PHONE,
    password: process.env.PASSWORD,
    avatar: process.env.AVATAR,
  },
};
