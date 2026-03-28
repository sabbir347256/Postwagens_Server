"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferenceService = void 0;
const notification_preferences_model_1 = require("./notification_preferences.model");
const getPreferences = async (userId) => {
    return await notification_preferences_model_1.NotificationPreference.findOne({ userId });
};
const updatePreferences = async (userId, preferences) => {
    return await notification_preferences_model_1.NotificationPreference.findOneAndUpdate({ userId }, { $set: { preferences } }, { new: true, upsert: true });
};
exports.NotificationPreferenceService = {
    getPreferences,
    updatePreferences,
};
