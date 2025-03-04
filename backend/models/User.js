const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profilePic: String,
  accessToken: String,  // Store Google OAuth Access Token
  refreshToken: String, // Store Google OAuth Refresh Token
});

module.exports = mongoose.model("User", UserSchema);
