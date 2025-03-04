var mongoose = require("mongoose");

var LetterSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    userId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Letter", LetterSchema);
