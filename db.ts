import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

let activePool: pg.Pool;

async function getPool() {
	if (!activePool) {
		activePool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}
	// Log pool errors
	activePool.on("error", (err) => {
		console.error("Unexpected error on idle client", err);
		process.exit(-1);
	});
	return activePool;
}

export const query = async (text: string, params: (string | number)[]) => {
	try {
		const pool = await getPool();
		const result = await pool.query(text, params);
		return result;
	} catch (error) {
		console.error("[Query] Error executing query:", error);
		throw error;
	}
};
