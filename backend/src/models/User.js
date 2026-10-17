const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  preferences: {
    stylePreferences: { type: [String], default: [] },
    favoriteColors: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
  },
  wardrobeSpaces: {
    type: [{
      id: String,
      name: String,
      isPrimary: Boolean,
    }],
    default: [{ id: 'home', name: 'Home', isPrimary: true }],
  },
  plan: {
    type: String,
    enum: ['free', 'curator'],
    default: 'free',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Never return passwordHash in JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
