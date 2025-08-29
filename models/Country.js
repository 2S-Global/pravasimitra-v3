import mongoose from "mongoose";

const CountrySchema = new mongoose.Schema({
  id: Number,
  name: String,
  currency: String,
  currencyName: String,
  status: Number,
  is_del: Number,
  publishable_key:String,
  secret_key:String
});

export default mongoose.models.Country || mongoose.model("Country", CountrySchema, "country");
