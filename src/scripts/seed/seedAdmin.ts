import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { envConfig } from "../../app/config/envConfig";
import User from "../../app/modules/user/user.model";
import { Provider, UserRole } from "../../app/constants/enums";

(async () => {
  try {
    console.log("⏳ Connecting to DB...");
    await mongoose.connect(envConfig.DATABASE_URL);

    const adminEmail = envConfig.ADMIN_EMAIL;
    const adminPassword = envConfig.ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", adminEmail);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      envConfig.BCRYPT_SALT_ROUNDS
    );

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: "Prolancer Admin",
      role: UserRole.ADMIN,
      isVerified: true,
      authProviders: [
        {
          provider: Provider.CREDENTIAL,
          providerId: adminEmail,
          isVerified: true,
        },
      ],
    });

    console.log("✅ Admin created successfully:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
})();
