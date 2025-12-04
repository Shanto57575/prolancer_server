import mongoose from "mongoose";
import Client from "../../app/modules/client/client.model";
import Freelancer from "../../app/modules/freelancer/freelancer.model";
import { envConfig } from "../../app/config/envConfig";
import {
  BudgetPreference,
  CompanySize,
} from "../../app/modules/client/client.interface";

(async () => {
  try {
    await mongoose.connect(envConfig.DATABASE_URL as string);
    console.log("Connected to DB");

    // --------------------
    // UPDATE CLIENTS
    // --------------------
    const clientResult = await Client.updateMany(
      {},
      {
        $set: {
          companySize: CompanySize.SMALL,
          budgetPreference: BudgetPreference.LOW,
          isVerifiedClient: true,
          isProfileComplete: false,
        },
      },
      { upsert: false }
    );

    console.log(`Clients updated: ${clientResult.modifiedCount}`);

    // --------------------
    // UPDATE FREELANCERS
    // --------------------
    const freelancerResult = await Freelancer.updateMany(
      {},
      {
        $set: {
          languages: [],
          education: [],
          availability: "",
          isProfileComplete: false,
        },
      },
      { upsert: false }
    );

    console.log(`Freelancers updated: ${freelancerResult.modifiedCount}`);

    await mongoose.connection.close();
    console.log("Migration Script Finished");
  } catch (err) {
    console.error("Migration Error:", err);
    process.exit(1);
  }
})();
