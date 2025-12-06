import Pusher from "pusher";
import { envConfig } from "../config/envConfig";

const pusher = new Pusher({
  appId: envConfig.PUSHER_APP_ID || "APP_ID_PLACEHOLDER",
  key: envConfig.PUSHER_KEY || "KEY_PLACEHOLDER",
  secret: envConfig.PUSHER_SECRET || "SECRET_PLACEHOLDER",
  cluster: envConfig.PUSHER_CLUSTER || "mt1",
  useTLS: true,
});

export default pusher;
