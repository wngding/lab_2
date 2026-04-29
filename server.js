require("dotenv").config();

const fastify = require("fastify")({ logger: true });
const path = require("path");
const nodemailer = require("nodemailer");

const PORT = Number(process.env.PORT || 3000);

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

fastify.post("/api/contact", async (request, reply) => {
  try {
    const { name, email, subject, message } = request.body || {};

    if (!name || !email || !subject || !message) {
      return reply.code(400).send({
        message: "Заповніть всі поля: name, email, subject, message",
      });
    }

    if (!isValidEmail(email)) {
      return reply.code(400).send({ message: "Некоректний email" });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return reply.code(500).send({
        message: "Немає SMTP_USER або SMTP_PASS у .env",
      });
    }

    if (!process.env.MAIL_TO || !process.env.MAIL_FROM) {
      return reply.code(500).send({
        message: "Немає MAIL_TO або MAIL_FROM у .env",
      });
    }

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Lab6"}" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
    });

    request.log.info(
      { messageId: info.messageId, response: info.response },
      "Email sent"
    );

    return reply.code(200).send({ message: "Лист відправлено!" });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ message: "Помилка відправки" });
  }
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`Server running: ${address}`);
});