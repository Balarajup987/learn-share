# Admin Complaint System Setup

## 🛡️ Complete User Complaint & Admin Management System

### ✅ **What's Implemented:**

#### **1. User Complaint System**

- **Report Users**: Users can report other users for inappropriate behavior
- **Complaint Categories**: Harassment, Spam, Fake Profile, Scam, etc.
- **Evidence Support**: Users can attach screenshots/evidence
- **Email Notifications**: Admin receives email alerts for new complaints

#### **2. Admin Dashboard**

- **Full Access**: Admin can view any user profile and complaints
- **Complaint Management**: Review, prioritize, and resolve complaints
- **User Actions**: Block, restrict, warn, or suspend users
- **Statistics**: Track complaint trends and resolution rates

#### **3. User Restrictions**

- **Status Management**: Active, Restricted, Blocked, Suspended
- **Feature Restrictions**: Can disable chat, connections, teaching, learning
- **Warning System**: Track user warnings and violations
- **Admin Notes**: Add notes about user behavior

### 🔧 **Setup Instructions:**

#### **1. Create Admin User**

Add an admin user to your database:

```javascript
// In MongoDB or via API
{
  name: "Admin User",
  email: "admin@learnshare.com",
  password: "hashed_password",
  role: "admin",
  status: "active"
}
```

#### **2. Email Configuration**

Add to your `.env` file:

```env
# Admin email notifications
ADMIN_EMAIL=admin@learnshare.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

#### **3. Access Admin Dashboard**

- Login with admin account
- Navigate to `/admin/dashboard`
- Full access to all complaints and user management

### 🚀 **Features:**

#### **For Users:**

- **Report Button**: Available on teacher profiles and explore page
- **Complaint Form**: Detailed form with categories and evidence
- **Status Tracking**: Users can see if their complaint was reviewed

#### **For Admin:**

- **Complaint Queue**: View all complaints with filters
- **User Management**: Block/restrict users based on complaints
- **Email Alerts**: Get notified of new complaints
- **Action History**: Track all admin actions and decisions

#### **Complaint Categories:**

- **Harassment**: Bullying, threats, inappropriate messages
- **Inappropriate Behavior**: Unprofessional conduct
- **Spam**: Excessive messaging, promotional content
- **Fake Profile**: False information, impersonation
- **Scam**: Fraudulent activities, payment scams
- **Other**: Miscellaneous issues

#### **Admin Actions:**

- **Warning**: Issue formal warning to user
- **Restrict**: Limit user capabilities (no chat/connections)
- **Block**: Complete account suspension
- **Suspend**: Temporary account suspension
- **Dismiss**: No action required

### 📧 **Email Notifications:**

Admin receives professional HTML emails with:

- Complaint details and priority level
- User information and evidence
- Direct link to admin dashboard
- Action required notifications

### 🔒 **Security Features:**

- **Admin Verification**: Only admin role can access dashboard
- **User Validation**: Prevent self-reporting and duplicate complaints
- **Action Logging**: All admin actions are tracked
- **Status Tracking**: Complete audit trail of complaint resolution

### 🎯 **Usage Flow:**

1. **User Reports**: User finds inappropriate behavior and clicks "Report User"
2. **Complaint Submitted**: Detailed complaint form with evidence
3. **Admin Notification**: Admin receives email alert
4. **Admin Review**: Admin reviews complaint in dashboard
5. **Action Taken**: Admin blocks/restricts user if needed
6. **Resolution**: Complaint marked as resolved with notes

The system is now fully functional and ready to maintain platform safety! 🛡️
