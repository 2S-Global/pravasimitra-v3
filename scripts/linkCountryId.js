import "dotenv/config";
import { connectDB } from "../lib/db.js";
import Country from "../models/Country.js";
import City from "../models/City.js";

async function run() {
  await connectDB();

  const targetIds = [7, 8, 19, 123, 124];

  for (const numericId of targetIds) {
    const country = await Country.findOne({ id: numericId });
    if (!country) {
      console.log(`❌ Country with id ${numericId} not found`);
      continue;
    }

    const result = await City.updateMany(
      { country_id: numericId },
      { $set: { country_id: country._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} cities for old country_id ${numericId}`);
  }

  process.exit();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
