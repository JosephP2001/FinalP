import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Serialización de usuario para sesiones
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar usuario existente por GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Usuario encontrado, devolver
          return done(null, user);
        }

        // Obtener email del perfil
        const email = profile.emails && profile.emails[0] 
          ? profile.emails[0].value 
          : `${profile.username}@github.user`;

        // Verificar si existe un usuario con ese email
        user = await User.findOne({ email });

        if (user) {
          // Usuario existe con ese email, vincular GitHub
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Crear nuevo usuario
        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          password: Math.random().toString(36).slice(-8), // Password aleatorio
          role: 'student'
        });

        done(null, user);
      } catch (error) {
        console.error('GitHub OAuth Error:', error);
        done(error, null);
      }
    }
  )
);

export default passport;