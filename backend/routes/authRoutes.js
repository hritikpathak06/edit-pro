var passport = require("passport");
var jwt = require("jsonwebtoken");
const express = require("express");
const { google } = require("googleapis");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
var router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    var token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.send("Logged out");
  });
});



router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});




router.post("/upload-text", async (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ message: "Missing user ID or content" });
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.accessToken) {
      return res.status(401).json({ message: "User not authenticated with Google" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({ access_token: user.accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Save content to a temporary file
    const filePath = path.join(__dirname, "upload.txt");
    fs.writeFileSync(filePath, content, "utf8");

    const response = await drive.files.create({
      requestBody: {
        name: "UploadedTextFile.txt",
        mimeType: "text/plain",
      },
      media: {
        mimeType: "text/plain",
        body: fs.createReadStream(filePath),
      },
    });

    // Delete temporary file
    fs.unlinkSync(filePath);

    res.json({ message: "File uploaded successfully", fileId: response.data.id });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: `File upload failed ${error.message}` });
  }
});





module.exports = router;
