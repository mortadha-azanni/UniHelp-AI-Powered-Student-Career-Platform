
import CV from "../models/CV.js";
import JobApplication from "../models/JobApplication.js";
import { draftApplicationEmail } from "../services/emailDraftChain.js";
import nodemailer from "nodemailer";



// Action 1: Generate the AI Draft
export const draftEmail = async (req, res) => {
    try {
        const { cvId, jobApplicationId } = req.body;

        // Validation
        if (!cvId || !jobApplicationId) {
            return res.status(400).json({ 
                success: false, 
                message: "Les identifiants du CV et de l'offre sont requis." 
            });
        }

        // 1. Fetch CV and Job Application for context
        const cv = await CV.findById(cvId);
        const job = await JobApplication.findById(jobApplicationId);

        if (!cv || !job) {
            return res.status(404).json({ 
                success: false, 
                message: "CV ou Offre d'emploi introuvable dans la base de données." 
            });
        }

        // 2. Call the LangChain service
        const draft = await draftApplicationEmail(cv.profileSnapshot, job.jobDescription);

        res.json({ success: true, data: draft });
    } catch (error) {
        console.error("Erreur lors de la génération du brouillon:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la génération du brouillon par l'IA.",
            error: error.message 
        });
    }
};

// Action 2: Send the Final Package
export const sendEmail = async (req, res) => {
    try {
        const { to, subject, message, cvId } = req.body;
        
        // 1. Validation
        if (!to || !subject || !message || !cvId) {
            return res.status(400).json({ 
                success: false, 
                message: "Tous les champs (destinataire, sujet, message, cvId) sont requis." 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Le fichier PDF du CV est manquant." 
            });
        }

        // Check SMTP Config
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            return res.status(500).json({ 
                success: false, 
                message: "Le service d'envoi d'emails n'est pas configuré sur le serveur." 
            });
        }

        const pdfBuffer = req.file.buffer;

        // 2. Get identity from the CV snapshot
        const cv = await CV.findById(cvId);
        if (!cv) {
            return res.status(404).json({ success: false, message: "CV introuvable." });
        }

        const userEmail = cv.profileSnapshot.personalInfo.email;
        const userName = cv.profileSnapshot.personalInfo.fullName;

        // 3. Configure Transporter (Technical Sender)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 4. Send with User Identity (Optimized for Spam Filters)
        const htmlMessage = message.replace(/\n/g, '<br>') + 
            `<br><br><hr><small>Cet email a été envoyé via l'application <b>Projet Nuit AI</b> au nom de <b>${userName}</b>.<br>Vous pouvez lui répondre directement à cette adresse : <a href="mailto:${userEmail}">${userEmail}</a></small>`;

        const info = await transporter.sendMail({
            from: `"${userName}" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            text: message + `\n\n---\nCet email a été envoyé via l'application Projet Nuit AI au nom de ${userName}.`,
            html: htmlMessage,
            replyTo: userEmail, 
            attachments: [{
                filename: `CV_${userName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log(`Email successfully sent to ${to}. Message ID: ${info.messageId}`);
        res.json({ success: true, message: 'Email envoyé avec succès !' });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        res.status(500).json({ 
            success: false, 
            message: "L'envoi de l'email a échoué. Vérifiez vos paramètres SMTP.",
            error: error.message 
        });
    }
};