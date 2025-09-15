# 📧 Email Setup Instructions

## 🚀 Quick Setup

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Configure Gmail SMTP
Edit `.env` file and add your Gmail credentials:

```bash
# Gmail SMTP Configuration (Nodemailer)
VITE_GMAIL_USER=your_gmail_email@example.com
VITE_GMAIL_PASS=your_gmail_password
```

### 3. Gmail Security Setup
For Gmail to work with SMTP, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `VITE_GMAIL_PASS`

### 4. Start Development Server
```bash
npm run dev
```

## 🔒 Security Notes

- ✅ `.env` is in `.gitignore` - credentials won't be uploaded to GitHub
- ✅ Use `.env.example` as a template for other developers
- ✅ Never commit real credentials to version control

## 📧 Email Features

- **Payment Success Emails**: Sent automatically when users complete payment
- **Credentials Emails**: Sent with login information
- **Beautiful HTML Templates**: Responsive design with Konsul Plan branding
- **Gmail SMTP**: Reliable delivery using your Gmail account

## 🛠️ Alternative Email Providers

If you prefer other email services, you can configure:

### SendGrid
```bash
VITE_SENDGRID_API_KEY=your_api_key
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_SENDGRID_FROM_NAME=Konsul Plan
```

### EmailJS
```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id
```

## 🚨 Troubleshooting

### Gmail Authentication Error
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check if "Less secure app access" is enabled (if not using App Password)

### Email Not Sending
- Check console logs for error messages
- Verify Gmail credentials are correct
- Ensure internet connection is stable

## 📞 Support

If you need help with email configuration, check the console logs for detailed error messages.
