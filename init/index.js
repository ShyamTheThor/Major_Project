const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");
const data = require("./data");

const dbUrl = "mongodb+srv://shyamthethor:shyam456@cluster0.cdtacdn.mongodb.net/rentify";

async function initDB() {
  await mongoose.connect(dbUrl);

  const user = await User.findOne({ username: "shyam" });

  const newData = data.map(obj => ({
    ...obj,
    owner: user._id
  }));

  await Listing.deleteMany({});
  await Listing.insertMany(newData);

  console.log("Data initialized with owner");
  process.exit();
}

initDB();