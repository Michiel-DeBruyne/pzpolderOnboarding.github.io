import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get SMTP transporter from Firestore or Env
  const getTransporter = async () => {
    const smtpDoc = await db.collection('settings').doc('smtp').get();
    const smtpData = smtpDoc.exists ? smtpDoc.data() : null;

    return nodemailer.createTransport({
      host: smtpData?.host || process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(smtpData?.port || process.env.SMTP_PORT || "587"),
      auth: {
        user: smtpData?.user || process.env.SMTP_USER || "user@example.com",
        pass: smtpData?.pass || process.env.SMTP_PASS || "password",
      },
    });
  };

  const getFromAddress = async () => {
    const smtpDoc = await db.collection('settings').doc('smtp').get();
    const smtpData = smtpDoc.exists ? smtpDoc.data() : null;
    return smtpData?.from || `"Gemeente Onboarding" <${process.env.SMTP_USER || 'noreply@gemeente.nl'}>`;
  };

  // API Route to send email
  app.post("/api/send-notification", async (req, res) => {
    const { to, subject, text } = req.body;
    
    const transporter = await getTransporter();
    const from = await getFromAddress();

    // @ts-ignore - options.auth might not be on all transport types but we know it's there for smtp
    if (!process.env.SMTP_USER && !transporter.options.auth?.user) {
      console.log("SMTP not configured. Email would have been sent to:", to);
      console.log("Subject:", subject);
      console.log("Text:", text);
      return res.json({ success: true, mocked: true });
    }

    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // API Route to send automated emails
  app.post("/api/send-automation-email", async (req, res) => {
    const { to, type, employeeName, completedTasks } = req.body;
    
    let subject = "";
    let html = "";

    try {
      // Fetch template from Firestore
      const templatesRef = db.collection('emailTemplates');
      const snapshot = await templatesRef.where('type', '==', type).limit(1).get();
      
      if (!snapshot.empty) {
        const templateData = snapshot.docs[0].data();
        subject = templateData.subject.replace('{{name}}', employeeName);
        html = templateData.body
          .replace(/{{name}}/g, employeeName)
          .replace('{{tasks}}', completedTasks.map((t: string) => `<li>${t}</li>`).join(''));
      } else {
        // Fallback to hardcoded if not found
        if (type === 'welcome') {
          subject = `Welkom bij de gemeente, ${employeeName}!`;
          html = `<h1>Welkom ${employeeName}!</h1><p>Je taken zijn afgerond.</p>`;
        } else {
          subject = `Bedankt, ${employeeName}`;
          html = `<h1>Bedankt ${employeeName}</h1><p>Succes met je volgende stap.</p>`;
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      return res.status(500).json({ error: "Failed to fetch email template" });
    }

    const transporter = await getTransporter();
    const from = await getFromAddress();

    // @ts-ignore - options.auth might not be on all transport types but we know it's there for smtp
    if (!process.env.SMTP_USER && !transporter.options.auth?.user) {
      console.log(`[MOCK EMAIL] To: ${to}, Type: ${type}`);
      return res.json({ success: true, mocked: true });
    }

    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send automation email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
