import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.githubId;
    },
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'github'],
    default: 'local'
  },
  providerId: String,
  avatar: String
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
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

const User = mongoose.model('User', userSchema);

// Get user's input
 const question = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

const createAdmin = async () => {
  try {
    console.log(' Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/survey_db');
    console.log(' Conectado a MongoDB\n');

    // Get Admin data from console
    const args = process.argv.slice(2);
    
    let adminData;
    
    if (args.length >= 3) {
      // Modo: node scripts/createAdmin.js "name" "email" "password"  >>>>!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      adminData = {
        name: args[0],
        email: args[1],
        password: args[2],
        role: 'admin',
        authProvider: 'local'
      };
    } else {
      // Interactive Mode
      console.log(' Modo interactivo - Ingresa los datos del administrador:\n');
      
      const name = await question('Nombre completo: ');
      const email = await question('Email: ');
      const password = await question('Password: ');
      
      adminData = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: 'admin',
        authProvider: 'local'
      };
    }

    // Basic Validation
    if (!adminData.name || adminData.name.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    if (!adminData.email || !adminData.email.includes('@')) {
      throw new Error('Email inválido');
    }
    if (!adminData.password || adminData.password.length < 6) {
      throw new Error('El password debe tener al menos 6 caracteres');
    }

    console.log('\n📋 Datos del administrador:');
    console.log('   Nombre:', adminData.name);
    console.log('   Email:', adminData.email);
    console.log('   Password:', '*'.repeat(adminData.password.length));
    console.log('   Role:', adminData.role);

    // Verificar si ya existe
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('\n  El usuario ya existe.');
      const overwrite = await question('¿Deseas reemplazarlo? (si/no): ');
      
      if (overwrite.toLowerCase() === 'si' || overwrite.toLowerCase() === 's') {
        await User.deleteOne({ email: adminData.email });
        console.log(' Usuario existente eliminado');
      } else {
        console.log(' Operación cancelada');
        process.exit(0);
      }
    }

    // CREATE user
    const adminUser = await User.create(adminData);
    
    console.log('\n✅ ¡Usuario administrador creado exitosamente!');
    console.log('\n📊 Información del usuario creado:');
    console.log('   ID:', adminUser._id);
    console.log('   Nombre:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Auth Provider:', adminUser.authProvider);
    console.log('   Creado:', adminUser.createdAt);

    // PASSWORD verification
    const userWithPassword = await User.findById(adminUser._id).select('+password');
    const isPasswordValid = await bcrypt.compare(adminData.password, userWithPassword.password);
    
    console.log('\n🔐 Verificación de password:');
    console.log('   Password hasheado:', userWithPassword.password.substring(0, 20) + '...');
    console.log('   Validación correcta:', isPasswordValid ? '✅ SÍ' : '❌ NO');

    if (isPasswordValid) {
      console.log('\n✅ Todo está correcto. Puedes iniciar sesión con:');
      console.log('   Email:', adminUser.email);
      console.log('   Password:', adminData.password);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit();
  }
};

createAdmin();