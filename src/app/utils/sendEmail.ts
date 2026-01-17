/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import { envConfig } from "../config/envConfig";
import { AppError } from "./AppError";

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
  port: Number(envConfig.SMTP_PORT),
  host: envConfig.SMTP_HOST,
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envConfig.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F  Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log(`Email sending error`, error.message);
    throw new AppError(500, "Email Sending error");
  }
};
