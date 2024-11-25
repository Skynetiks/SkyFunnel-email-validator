import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync("certs/us-east-1-bundle.pem"),
  },
});

export const query = async (text: string, params: (string | number)[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export default pool;