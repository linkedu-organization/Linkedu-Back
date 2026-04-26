import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

import { AppError } from '../errors/AppError';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const loadTemplate = (template: string, replacements?: Record<string, string>) => {
  const templatePath = path.resolve(process.cwd(), 'src/templates', template);
  let html = fs.readFileSync(templatePath, 'utf8');
  if (replacements) {
    Object.keys(replacements).forEach(key => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]!);
    });
  }
  return html;
};

export const sendEmail = async (
  to: string,
  subject: string,
  template: string,
  replacements?: Record<string, string>,
) => {
  try {
    const html = loadTemplate(template, replacements);
    await transporter.sendMail({
      from: `Linkedu Support <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(error);
    throw new AppError('Erro ao enviar email. Verifique o endereço e tente novamente.', 500);
  }
};
