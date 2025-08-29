import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  id: Number,
  name: String,
  country_id: mongoose.Schema.Types.Mixed, // Can be Number or ObjectId
  is_del: Number
});

export default mongoose.models.City || mongoose.model("City", CitySchema, "city");
