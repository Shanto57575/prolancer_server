import mongoose from "mongoose";
import User from "../../app/modules/user/user.model";
import { envConfig } from "../../app/config/envConfig";

async function run() {
  try {
    await mongoose.connect(envConfig.DATABASE_URL as string);

    const result = await User.updateMany(
      { isBanned: { $exists: false } },
      { $set: { isBanned: false } }
    );

    console.log("Migration done:", result);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
