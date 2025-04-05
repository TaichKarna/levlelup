// auth-api/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          $or: [
            { providerId: profile.id, provider: 'google' },
            { email: profile.emails[0].value },
          ],
        });

        if (user) {
          // If user exists but was using a different auth method
          if (user.provider !== 'google') {
            user.provider = 'google';
            user.providerId = profile.id;
            user.isVerified = true;
            await user.save();
          }
        } else {
          // Create new user
          user = new User({
            username:
              profile.displayName.replace(/\s+/g, '_').toLowerCase() +
              Math.floor(Math.random() * 1000),
            email: profile.emails[0].value,
            provider: 'google',
            providerId: profile.id,
            profilePicture: profile.photos[0].value,
            isVerified: true,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get primary email from GitHub
        const primaryEmail =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (!primaryEmail) {
          return done(new Error('Email not available from GitHub'), null);
        }

        // Check if user already exists
        let user = await User.findOne({
          $or: [
            { providerId: profile.id, provider: 'github' },
            { email: primaryEmail },
          ],
        });

        if (user) {
          // If user exists but was using a different auth method
          if (user.provider !== 'github') {
            user.provider = 'github';
            user.providerId = profile.id;
            user.isVerified = true;
            await user.save();
          }
        } else {
          // Create new user
          user = new User({
            username:
              profile.username || `github_${Math.floor(Math.random() * 10000)}`,
            email: primaryEmail,
            provider: 'github',
            providerId: profile.id,
            profilePicture:
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : '',
            isVerified: true,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
