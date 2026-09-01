const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ─────────────────────────────────────────────────────────────────────────────
// User Schema — For Students (Signup + Login)
//
// Students can:
//   • Sign up with email + password
//   • Log in and get a JWT token
//   • View their own order history
//
// NOTE: Admin is NOT stored in this collection.
//       Admin logs in using credentials from .env (predefined).
// ─────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        name: {
            type:     String,
            required: [true, "Name is required"],
            trim:     true,
        },
        email: {
            type:     String,
            required: [true, "Email is required"],
            unique:   true,
            trim:     true,
            lowercase: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type:     String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select:   false, // Never returned in queries by default
        },
        phone: {
            type:  String,
            trim:  true,
            default: "",
        },
        rollNumber: {
            type:  String,
            trim:  true,
            default: "",
        },
        role: {
            type:    String,
            enum:    ["student"],
            default: "student",
        },
    },
    {
        timestamps: true,
    }
);

// ── Pre-save Hook: Hash password before storing ───────────────────────────────
userSchema.pre("save", async function () {
    // Only hash if password field was modified (avoid double-hashing)
    if (!this.isModified("password")) return;
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Method: Compare entered password with stored hash ────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
