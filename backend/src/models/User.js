import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // ✅ Solo requerido si NO usa GitHub OAuth
      return !this.githubId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  // AGREGAR estos campos para GitHub OAuth
  authProvider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local'
  },
  providerId: String,
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si hay password Y fue modificado
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method --> Password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Is the password? (GitHub user), -> false
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: DO NOT EXPOSE PASSWORD 
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

export default mongoose.model('User', userSchema);