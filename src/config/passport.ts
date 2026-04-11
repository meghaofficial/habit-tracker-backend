import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel";

// this passport middleware configure the stategies which involves verifying username and password credentials, delegated authentication using OAuth (for example, via Facebook or Twitter), or federated authentication using OpenID
// Before authenticating requests, the strategy (or strategies) used by an application must be configured.
// To avoid those headache we use passport middleware.

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  const existing = await User.findOne({ providerId: profile.id });

  if (existing) return done(null, existing);

  const user = await User.create({
    username: profile.displayName,
    email: profile.emails?.[0].value,
    provider: "google",
    providerId: profile.id,
  });

  done(null, user);
}));