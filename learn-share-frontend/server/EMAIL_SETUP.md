# Email Setup for OTP Password Reset

## 1. Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password

1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the generated 16-character password

### Step 3: Configure Environment Variables

Create a `.env` file in the server directory with:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Other existing variables
MONGODB_URI=mongodb://localhost:27017/learnshare
JWT_SECRET=your_jwt_secret_key_here
PORT=5001
```

## 2. Alternative Email Services

### Outlook/Hotmail

```javascript
const transporter = nodemailer.createTransporter({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Yahoo

```javascript
const transporter = nodemailer.createTransporter({
  service: "yahoo",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 3. Testing the Setup

1. Start your server: `npm run dev`
2. Go to the login page
3. Click "Forgot Password?"
4. Enter your email address
5. Check your email for the OTP
6. Enter the OTP and new password

## 4. Troubleshooting

### Common Issues:

- **"Invalid login"**: Check your email and app password
- **"Connection timeout"**: Verify internet connection and email service
- **"OTP not received"**: Check spam folder, verify email address

### Debug Mode:

The system will log email sending status to the console. Check server logs for detailed error messages.
