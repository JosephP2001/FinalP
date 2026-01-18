import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
    index: true
  },
  respondentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email inválido'
    }
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// ÍNDICE COMPUESTO: Evita respuestas duplicadas por email + encuesta
responseSchema.index({ surveyId: 1, respondentEmail: 1 }, { unique: true });

// MÉTODO: Verificar si un email ya respondió
responseSchema.statics.hasResponded = async function(surveyId, email) {
  const count = await this.countDocuments({
    surveyId,
    respondentEmail: email.toLowerCase()
  });
  return count > 0;
};

export default mongoose.model('Response', responseSchema);