import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

        let user = await User.findOne({
          $or: [
            { email: email },
            { providerId: profile.id, authProvider: 'github' }
          ]
        });

        if (user) {
          if (user.authProvider !== 'github') {
            user.authProvider = 'github';
            user.providerId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          authProvider: 'github',
          providerId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'student',
          password: Math.random().toString(36).slice(-12)
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;