# Admin Complaints Management Guide

## ✅ User Restrictions Update - COMPLETED

All users in your database have been successfully updated with the proper status and restrictions fields:

### Migration Results:
- **Total users processed:** 12
- **Users updated:** 0 (all were already configured)
- **Admin user fixed:** admin@learnshare.com role changed from "teacher" to "admin" ✓
- **Status:** All users now have:
  - `status` field (default: 'active')
  - `restrictions` object (all permissions enabled by default)
  - `warningCount` (default: 0)

### Admin User Verified:
- **Email:** admin@learnshare.com
- **Name:** Admin
- **Role:** admin ✓
- **Status:** active
- **Can access Admin Panel:** Yes ✓

### User Status Options:
- **active** - Normal user with full permissions
- **restricted** - User with limited permissions
- **blocked** - User cannot access the platform
- **suspended** - Temporarily suspended

### Restriction Controls:
Each user has the following restriction flags:
- `canConnect` - Can send/accept connection requests
- `canChat` - Can use chat functionality
- `canTeach` - Can create and teach courses
- `canLearn` - Can enroll in courses

---

## 📋 How to Access Admin Complaints Dashboard

### For Admin Users:

1. **Login** to your account with admin credentials

2. **Click on your profile circle** in the top-right corner of the navigation bar
   - This is the green circle with your first letter

3. **Select "Admin Panel"** from the dropdown menu
   - This option only appears for users with role = "admin"

4. **You will be redirected to:** `/admin` (Admin Dashboard)

### Admin Dashboard Features:

#### 📊 Statistics Overview
The dashboard shows:
- Pending Complaints count
- High Priority complaints count
- Under Review complaints count
- Resolved complaints count

#### 🔍 Filtering Options
You can filter complaints by:
- **Status:** All, Pending, Under Review, Resolved, Dismissed
- **Priority:** All, Urgent, High, Medium, Low

#### 📝 Complaint Details
Each complaint shows:
- Subject and description
- Complainant information
- Reported user information
- Category and priority
- Current status
- Submission date

#### ⚡ Admin Actions
When viewing a complaint in detail, admins can:
1. **Issue Warning** - Give the user a warning
2. **Restrict User** - Limit user permissions
3. **Block User** - Prevent user access
4. **Suspend User** - Temporarily suspend account
5. **Dismiss Complaint** - Close complaint without action

#### 📌 Admin Notes
- Add administrative notes to complaints
- View previous notes from other admins
- Track action history

---

## 🔐 Admin Access Routes

### Available Routes:
- **Admin Dashboard:** `http://localhost:5173/admin`
- **Regular Complaints (User View):** `http://localhost:5173/complaints`

### Navigation Structure:
```
User Profile Dropdown (when logged in as admin):
├── Dashboard
├── Admin Panel ← Access all complaints here
├── Update Profile
├── My Complaints ← Only your own complaints
├── My Courses
├── Connections
├── Requests Received
└── Logout
```

---

## 🛠️ Technical Details

### Backend Endpoints:
- **GET** `/api/complaints/all` - Fetch all complaints (admin only)
- **PUT** `/api/complaints/:id/action` - Take action on complaint (admin only)

### User Model Fields:
```javascript
{
  status: "active" | "restricted" | "blocked" | "suspended",
  restrictions: {
    canConnect: true,
    canChat: true,
    canTeach: true,
    canLearn: true
  },
  warningCount: 0,
  adminNotes: "...",
  lastWarningDate: Date
}
```

### Complaint Model Fields:
```javascript
{
  complainant: User,
  reportedUser: User,
  subject: String,
  description: String,
  category: String,
  priority: "low" | "medium" | "high" | "urgent",
  status: "pending" | "under_review" | "resolved" | "dismissed",
  adminNotes: String
}
```

---

## 🚀 Quick Start for Admins

1. Ensure you have admin privileges (role = "admin")
2. Login at: `http://localhost:5173/login`
3. Click your profile circle → "Admin Panel"
4. View and manage all user complaints
5. Take appropriate actions as needed

---

## 📞 Troubleshooting

### "I don't see the Admin Panel option"
- Verify your user role is set to "admin" in the database
- Check if you're logged in
- Try logging out and logging back in

### "I can't access /admin route"
- Only users with role="admin" can access this page
- Regular users will see an "Access Denied" message

### "Migration script needed?"
- The migration has already been run
- All users have the proper fields configured
- No further action needed unless adding new fields

---

## 📁 Related Files

### Frontend:
- `/src/pages/AdminDashboard.jsx` - Admin complaints view
- `/src/pages/Complaints.jsx` - User complaints view
- `/src/components/Navbar.jsx` - Navigation with admin link

### Backend:
- `/server/models/User.js` - User model with restrictions
- `/server/models/Complaint.js` - Complaint model
- `/server/routes/adminRoutes.js` - Admin endpoints
- `/server/routes/complaintRoutes.js` - Complaint endpoints
- `/server/updateUserRestrictions.js` - Migration script

---

**Last Updated:** October 22, 2025
**Status:** ✅ All systems operational
