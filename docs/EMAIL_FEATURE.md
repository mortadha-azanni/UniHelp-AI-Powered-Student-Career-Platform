# Feature Documentation: AI-Powered Email Drafting & Mailing

## Overview

This feature allows users to generate professional, personalized job application emails using AI and send them directly to recruiters with their compiled CV attached as a PDF.

## 🏗 Architecture

### 1. AI Drafting Service (`server/services/emailDraftChain.js`)

- **Engine**: Powered by `@langchain/google-genai` using the `gemini-flash-latest` model.
- **Logic**:
  - Takes the candidate's CV profile snapshot and the job description as context.
  - Uses `StructuredOutputParser` with Zod to ensure a consistent JSON response containing `subject` and `body`.
  - Temperature is set to `0.7` for a balance between creativity and professionalism.

### 2. API Controller (`server/controllers/emailController.js`)

- **`draftEmail`**: Retrieves the CV and Job data from MongoDB, invokes the AI service, and returns the draft.
- **`sendEmail`**:
  - Validates input fields and existence of the PDF file.
  - Extracts the candidate's name and email from the CV snapshot to use in the email headers (`replyTo`).
  - Uses `nodemailer` to send the email via the configured SMTP server.
  - Attaches the CV PDF (received via `multer` from the frontend).

### 3. Frontend Integration (`client/src/pages/GenerateCVPage.jsx`)

- **Email Modal**: A premium glassmorphic modal where users can:
  - Input the recruiter's email.
  - Review and edit the AI-generated subject and body.
  - Track the "Sending..." status with visual feedback.
- **PDF Compilation**: The CV is compiled client-side using `texlyre-busytex` (XeLaTeX) and sent to the backend as a `FormData` blob.

## ⚙️ Configuration (Environment Variables)

To use this feature, ensure the following variables are set in your `.env` file:

### AI Configuration

- `GOOGLE_API_KEY`: Your Google AI Studio API key.

### SMTP Configuration (Sending Emails)

- `SMTP_HOST`: The hostname of your SMTP server (e.g., `smtp.gmail.com`).
- `SMTP_PORT`: The port (usually `465` for SSL or `587` for STARTTLS).
- `SMTP_USER`: The technical email address used to send the emails.
- `SMTP_PASS`: The password or App Password for the SMTP user.

> [!IMPORTANT]
> The `from` address will show the candidate's name, but the actual technical sender will be `SMTP_USER`. The `replyTo` field is set to the candidate's email address so that recruiters respond directly to them.

## 🚀 How to Test

1. **Prerequisites**: Ensure you have a generated CV and a job application saved.
2. **Open Modal**: In the CV Generation page, click on the "Envoyer mail" button.
3. **Drafting**: The AI will automatically generate a draft. Wait for the content to appear in the fields.
4. **Edit**: Modify the subject or body if needed.
5. **Send**: Enter a recipient email and click "Confirmer l'envoi".
6. **Verify**:
   - Check the console for successful API logs.
   - Verify the recipient's inbox (if testing with a real email).
   - If it fails, check the `server` logs for SMTP connection errors.

## 🛡 Security & Hardening

- **Input Validation**: Backend strictly checks for all required fields and file attachments.
- **Error Handling**: Graceful failures with user-friendly messages on the frontend.
- **File Limits**: `multer` is configured to handle the PDF upload safely.
