

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const session = require('express-session'); //
const passport = require('passport'); //
const GoogleStrategy = require('passport-google-oauth20').Strategy; //

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session setup (Google login ke liye zaroori hai)
app.use(session({
    secret: 'ohhideax_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', 
    database: 'ohhideax_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database! ✅');
});

// --- GOOGLE STRATEGY SETUP ---
passport.use(new GoogleStrategy({
    clientID: "276097152949-v1ne6qbro1u4flcjggj08s1jf0jvdlsj.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    const name = profile.displayName;
    const email = profile.emails[0].value;
    const profile_url = profile.photos[0].value;

    // Database mein user save karne ka logic
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, result) => {
        if (result.length === 0) {
            const insertSql = "INSERT INTO users (name, email, profile_url) VALUES (?, ?, ?)";
            db.query(insertSql, [name, email, profile_url], (err, res) => {
                console.log("The google user has been saved! ✅");
            });
        } else {
            console.log("The user is already in the database. ✅");
        }
    });
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Signup API Route (Old method)
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const profile_url = 'default-profile.png'; 
    const sql = "INSERT INTO users (name, email, password, profile_url) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, profile_url], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error!" });
        res.json({ success: true, message: "User registered! ✅" });
    });
});

// --- GOOGLE LOGIN ROUTES ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard.html'); 
  }
);

//  Frontend ko user data bhejne ke liye
app.get('/user-data', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            name: req.user.displayName,
            photo: req.user.photos[0].value
        });
    } else {
        res.json({ name: null });
    }
});

//  Logout karne ke liye
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} 🚀`);
});