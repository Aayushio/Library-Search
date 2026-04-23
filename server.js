const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

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
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log("❌ MongoDB Error:", err);
});

/* ==========================================
   MODELS
========================================== */

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: String,
        default: "reader"
    }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
    title: String,
    genre: String,
    year: String,
    image: String,
    desc: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC));

/* ==========================================
   PAGE ROUTES
========================================== */

const pages = [
    "index",
    "login",
    "signup",
    "dashboard",
    "admin",
    "upload",
    "leaderboard",
    "book",
    "author",
    "search",
    "aboutus",
    "contact"
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
            return res.json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const exists = await User.findOne({ email });

        if (exists) {
            return res.json({
                success: false,
                message: "Email already exists"
            });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role: role || "reader"
        });

        res.json({
            success: true,
            message: "Signup successful",
            redirect:
                newUser.role === "author"
                    ? "admin.html"
                    : "dashboard.html"
        });

    } catch (error) {

        res.json({
            success: false,
            message: "Signup failed"
        });

    }

});

/* ==========================================
   LOGIN
========================================== */

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            email,
            password
        });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            redirect:
                user.role === "author"
                    ? "admin.html"
                    : "dashboard.html",
            user
        });

    } catch (error) {

        res.json({
            success: false,
            message: "Login failed"
        });

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
   ADD BOOK
========================================== */

app.post("/api/books/add", async (req, res) => {

    try {

        const { title, genre, year, image, desc } = req.body;

        if (!title || !genre || !year) {
            return res.json({
                success: false,
                message: "Please fill required fields"
            });
        }

        await Book.create({
            title,
            genre,
            year,
            image,
            desc
        });

        res.json({
            success: true,
            message: "Book uploaded successfully"
        });

    } catch (error) {

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
   DELETE BOOK
========================================== */

app.delete("/api/books/:id", async (req, res) => {

    try {

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