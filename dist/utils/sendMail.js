"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const transporter = nodemailer_1.default.createTransport({
    secure: false,
    auth: {
        user: env_1.default.EMAIL_USER,
        pass: env_1.default.EMAIL_PASSWORD,
    },
    port: Number(env_1.default.EMAIL_PORT),
    host: env_1.default.EMAIL_HOST,
});
const sendEmail = async ({ to, cc, bcc, subject, templateName, templateData, attachements, }) => {
    try {
        const templatePath = path_1.default.join(__dirname, `templates/${templateName}.ejs`);
        const html = await ejs_1.default.renderFile(templatePath, templateData);
        await transporter.sendMail({
            from: `"${env_1.default.EMAIL_FROM_NAME}" <${env_1.default.EMAIL_FROM}>`,
            to: to,
            cc,
            bcc,
            subject: subject,
            html: html,
            attachments: attachements?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            })),
        });
    }
    catch (error) {
        console.log('Email sending error', error.message);
        console.error('EMAIL ERROR 👉', error);
        throw new AppError_1.default(400, 'Email error');
    }
};
exports.sendEmail = sendEmail;
