const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Serve Static files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

console.log("Dirname==>> ", __dirname);
console.log(path.join(__dirname, "frontend/dist"));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
    },
    function (accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5000",
  }),
  function (req, res) {
    res.redirect("http://localhost:5000/dashboard");
  }
);

app.get("/auth/user", (req, res) => {
  res.json(req.user || null);
});

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy();
    res.redirect("http://localhost:5173");
  });
});

const upload = multer({ dest: "uploads/" });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.isAuthenticated() || !req.user.accessToken) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const oauth2Client = new google.auth.OAuth2();
//   oauth2Client.setCredentials({ access_token: req.user.accessToken });

//   const drive = google.drive({ version: "v3", auth: oauth2Client });

//   try {
//     const folderName = "letter-scribble";
//     const folderList = await drive.files.list({
//       q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//       fields: "files(id, name)",
//     });

//     let folderId;
//     if (folderList.data.files.length > 0) {
//       folderId = folderList.data.files[0].id;
//     } else {
//       const folderMetadata = {
//         name: folderName,
//         mimeType: "application/vnd.google-apps.folder",
//       };
//       const folder = await drive.files.create({
//         resource: folderMetadata,
//         fields: "id",
//       });
//       folderId = folder.data.id;
//     }

//     const fileMetadata = {
//       name: req.file.originalname,
//       parents: [folderId],
//     };
//     const media = {
//       mimeType: req.file.mimetype,
//       body: fs.createReadStream(req.file.path),
//     };
//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id, name",
//     });

//     fs.unlinkSync(req.file.path);

//     res.json({ message: "File uploaded successfully", fileId: file.data.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "File upload failed" });
//   }
// });

app.post("/save-doc", async (req, res) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { content } = req.body;
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const folderName = "letter-scribble";
    const folderList = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
    });

    let folderId;
    if (folderList.data.files.length === 0) {
      const folder = await drive.files.create({
        resource: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
      folderId = folder.data.id;
    } else {
      folderId = folderList.data.files[0].id;
    }

    // Create Google Doc
    const fileMetadata = {
      name: `Document-${Date.now()}.doc`,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    };
    const media = {
      mimeType: "text/html",
      body: content,
    };
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, name, webViewLink",
    });

    res.json({ message: "Document saved successfully", file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save document" });
  }
});

app.get("/files", async (req, res) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: req.user.accessToken });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const folderName = "letter-scribble";
    const folderList = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (folderList.data.files.length === 0) {
      return res.json({ message: "Folder not found", files: [] });
    }

    const folderId = folderList.data.files[0].id;

    const fileList = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink)",
    });

    res.json({ files: fileList.data.files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve files" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
