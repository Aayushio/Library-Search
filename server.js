const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ==========================================
   PATHS
========================================== */

const PUBLIC = path.join(__dirname, "public");

/* ==========================================
   MONGODB CONNECT
========================================== */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

/* ==========================================
   MODELS
========================================== */

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "reader" }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
    title: String,
    genre: String,
    year: String,
    image: String,
    desc: String,
    pdf: String   // 🔥 NEW FIELD
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);

/* ==========================================
   MULTER SETUP (FILE UPLOAD)
========================================== */

// create uploads folder if not exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC));

// serve uploaded PDFs
app.use("/uploads", express.static("uploads"));

/* ==========================================
   PAGE ROUTES
========================================== */

const pages = [
    "index","login","signup","dashboard","admin",
    "upload","leaderboard","book","author",
    "search","aboutus","contact"
];

pages.forEach(page => {
    app.get("/" + page, (req, res) => {
        res.sendFile(path.join(PUBLIC, `${page}.html`));
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(PUBLIC, "index.html"));
});

/* ==========================================
   SIGNUP
========================================== */

app.post("/api/signup", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill all fields" });
        }

        const exists = await User.findOne({ email });

        if (exists) {
            return res.json({ success: false, message: "Email already exists" });
        }

        const newUser = await User.create({
            name, email, password, role: role || "reader"
        });

        res.json({
            success: true,
            message: "Signup successful",
            redirect: newUser.role === "author"
                ? "admin.html"
                : "dashboard.html"
        });

    } catch (error) {
        res.json({ success: false, message: "Signup failed" });
    }

});

/* ==========================================
   LOGIN
========================================== */

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            redirect: user.role === "author"
                ? "admin.html"
                : "dashboard.html",
            user
        });

    } catch (error) {
        res.json({ success: false, message: "Login failed" });
    }

});

/* ==========================================
   GET USERS
========================================== */

app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

/* ==========================================
   ADD BOOK (PDF UPLOAD ENABLED)
========================================== */

app.post("/api/books/add", upload.single("pdf"), async (req, res) => {

    try {

        const { title, genre, year, image, desc } = req.body;

        if (!title || !genre || !year) {
            return res.json({
                success: false,
                message: "Please fill required fields"
            });
        }

        const pdfPath = req.file ? `/uploads/${req.file.filename}` : "";

        await Book.create({
            title,
            genre,
            year,
            image,
            desc,
            pdf: pdfPath
        });

        res.json({
            success: true,
            message: "Book uploaded successfully"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Upload failed"
        });

    }

});

/* ==========================================
   GET BOOKS
========================================== */

app.get("/api/books", async (req, res) => {

    const books = await Book.find().sort({ createdAt: -1 });

    res.json(books);

});

/* ==========================================
   DELETE BOOK + PDF DELETE
========================================== */

app.delete("/api/books/:id", async (req, res) => {

    try {

        const book = await Book.findById(req.params.id);

        // delete PDF file from server
        if (book && book.pdf) {
            const filePath = path.join(__dirname, book.pdf);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Book.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Book deleted"
        });

    } catch (error) {

        res.json({
            success: false,
            message: "Delete failed"
        });

    }

});

/* ==========================================
   404
========================================== */

app.use((req, res) => {
    res.status(404).sendFile(path.join(PUBLIC, "index.html"));
});

/* ==========================================
   START
========================================== */

app.listen(PORT, () => {

    console.log(`
=================================
 BookSphere Running Successfully
 http://localhost:${PORT}
=================================
`);

});