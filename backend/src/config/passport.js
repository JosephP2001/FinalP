import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Serialize user for sessions
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

// GitHub OAuth Strategy
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
        // Find existing user by GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // User found, return
          return done(null, user);
        }

        // Get email from profile
        const email = profile.emails && profile.emails[0] 
          ? profile.emails[0].value 
          : `${profile.username}@github.user`;

        // Check if user exists with that email
        user = await User.findOne({ email });

        if (user) {
          // User exists with that email, link GitHub account
          user.githubId = profile.id;
          user.authProvider = 'github';
          user.providerId = profile.id;
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          password: Math.random().toString(36).slice(-8), // Random password
          role: 'user', //  Changed from 'student' to 'user'
          authProvider: 'github',
          providerId: profile.id,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
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