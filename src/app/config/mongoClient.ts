import { MongoClient } from "mongodb";
import { envConfig } from "./envConfig";

const client = new MongoClient(envConfig.DATABASE_URL);

(async () => {
  await client.connect();
})();

export default client;
