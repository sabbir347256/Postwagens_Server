"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_apple_1 = require("passport-apple");
const user_model_1 = __importDefault(require("../modules/users/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("./env"));
const user_interface_1 = require("../modules/users/user.interface");
// CREDENTIALS LOGIN LOCAL STRATEGY
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            return done(null, false, { message: 'User does not exist!' });
        }
        // Check Google User
        const isGoogleUser = user.auths?.some((provider) => provider.provider === 'google');
        if (isGoogleUser) {
            return done(null, false, {
                message: 'Please Login with Google!',
            });
        }
        // Matching Password
        const isMatchPassowrd = await bcrypt_1.default.compare(password, user.password);
        if (!isMatchPassowrd) {
            return done(null, false, { message: 'Incorrect password!' });
        }
        return done(null, user);
    }
    catch (error) {
        console.log('Passport Local login error: ', error);
        done(error);
    }
}));
// GOOGLE REGISTRATION
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.default.GOOGLE_OAUTH_ID,
    clientSecret: env_1.default.GOOGLE_OAUTH_SECRET,
    callbackURL: env_1.default.GOOGLE_CALLBACK_URL,
}, async function (_accessToken, _refreshToken, profile, cb) {
    const email = profile.emails?.[0].value;
    if (!email) {
        return cb(null, false, { message: 'No email found' });
    }
    let user = await user_model_1.default.findOne({ email });
    if (!user) {
        user = await user_model_1.default.create({
            fullName: profile.displayName,
            email,
            avatar: profile.photos?.[0].value,
            role: user_interface_1.Role.USER,
            isVerified: false,
            auths: [
                {
                    provider: 'google',
                    providerId: profile.id,
                },
            ],
        });
    }
    return cb(null, user);
}));
// APPLE REGISTRATION
passport_1.default.use(
// @ts-ignore
new passport_apple_1.Strategy({
    clientID: env_1.default.APPLE_OAUTH_ID,
    clientSecret: env_1.default.APPLE_OAUTH_SECRET,
    callbackURL: env_1.default.APPLE_CALLBACK_URL,
    teamID: env_1.default.APPLE_TEAM_ID,
    keyID: env_1.default.APPLE_KEY_ID,
    scope: ['name', 'email'],
    passReqToCallback: false,
}, async function (_accessToken, _refreshToken, profile, cb) {
    const email = profile.emails?.[0].value;
    if (!email) {
        return cb(null, false, { message: 'No email found' });
    }
    let user = await user_model_1.default.findOne({ email });
    if (!user) {
        user = await user_model_1.default.create({
            fullName: profile.displayName,
            email,
            avatar: profile.photos?.[0].value,
            role: user_interface_1.Role.USER,
            isVerified: false,
            auths: [
                {
                    provider: 'apple',
                    providerId: profile.id,
                },
            ],
        });
    }
    return cb(null, user);
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
});
