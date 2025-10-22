# Admin Functionality Documentation

This document outlines all the admin functionalities implemented in the LearnShare platform.

## Overview

The admin system provides comprehensive tools for managing user complaints, blocking/restricting users, and maintaining platform safety.

## Features Implemented

### 1. Admin Authentication & Authorization

- **Admin Role Check Middleware** (`server/middleware/adminAuth.js`)
  - Verifies JWT token
  - Checks if user has admin role
  - Prevents blocked/suspended admins from accessing admin routes
  - Protects all admin-only endpoints

### 2. User Status Management

Users can have the following statuses:
- `active` - Normal user with full access
- `restricted` - Limited access (can't connect or chat)
- `blocked` - Complete platform block (can't login)
- `suspended` - Temporary suspension

### 3. Complaint System

#### Complaint Routes (`/api/complaints/`)

- **POST `/submit`** - Submit a new complaint
  - Anyone can file a complaint against another user
  - Sends email notification to admin
  - Auto-saves to database
  
- **GET `/all`** - Get all complaints (Admin only)
  - Returns all complaints with user details
  - Sorted by creation date (newest first)
  
- **GET `/:id`** - Get specific complaint (Admin only)
  - Detailed complaint view with full user information
  
- **PUT `/:id/status`** - Update complaint status (Admin only)
  - Change status: pending, under_review, resolved, dismissed
  - Add admin notes
  
- **PUT `/:id/action`** - Take action on reported user (Admin only)
  - Issue warning
  - Restrict user
  - Block user
  - Suspend user
  - Dismiss complaint
  
- **GET `/user/:userId/history`** - Get user's complaint history (Admin only)
  - View all complaints by or against a specific user

### 4. Admin User Management

#### Admin Routes (`/api/admin/`)

- **GET `/users`** - Get all users with filtering
  - Filter by status, role, search query
  - Pagination support
  - Returns user list without sensitive data
  
- **GET `/users/:userId`** - Get specific user details
  - Complete user profile
  - Complaint statistics
  - Connection counts
  
- **PUT `/users/:userId/status`** - Update user status
  - Change user status (active, blocked, restricted, suspended)
  - Add admin notes
  - Apply restrictions automatically
  - Prevents admin from blocking themselves
  
- **POST `/users/:userId/warning`** - Issue warning to user
  - Increment warning count
  - Record warning date
  - Add admin notes
  
- **DELETE `/users/:userId`** - Delete user account (permanent)
  - Removes user and all related complaints
  - Prevents admin from deleting themselves
  
- **GET `/statistics`** - Get platform statistics
  - Total users by status and role
  - Complaint statistics
  - High priority complaints count
  - Recent activity
  
- **POST `/users/bulk-action`** - Perform bulk actions
  - Block/restrict/activate multiple users at once
  - Prevents admin from affecting themselves

### 5. Login Protection

- Blocked users cannot login
- Suspended users cannot login
- Clear error messages shown
- Status checked during authentication

### 6. Admin Dashboard Features

#### UI Components

1. **Statistics Cards**
   - Pending complaints count
   - High priority complaints
   - Under review complaints
   - Resolved complaints

2. **Filtering System**
   - Filter by status (all, pending, under_review, resolved, dismissed)
   - Filter by priority (all, urgent, high, medium, low)

3. **Complaint List**
   - Shows all complaints with key details
   - Click to view full details
   - Status and priority badges
   - User information display

4. **Complaint Detail Modal**
   - Complete complaint information
   - User status badges
   - Warning count for reported users
   - Admin action selector
   - Admin notes textarea
   - Execute action button

## User Status Effects

### Active Status
- ✅ Can connect with other users
- ✅ Can chat with connections
- ✅ Can teach courses
- ✅ Can learn from teachers

### Restricted Status
- ❌ Cannot connect with other users
- ❌ Cannot chat with connections
- ✅ Can teach courses
- ✅ Can learn from teachers

### Blocked Status
- ❌ Cannot connect with other users
- ❌ Cannot chat with connections
- ❌ Cannot teach courses
- ❌ Cannot learn from teachers
- ❌ Cannot login to platform

### Suspended Status
- ❌ Cannot login to platform
- All restrictions applied

## Email Notifications

When a complaint is submitted:
- Admin receives email notification (if configured)
- Email includes:
  - Complaint ID
  - Priority level
  - Subject and description
  - Category and date
  - Link to admin dashboard

## Security Features

1. **Admin Authentication**
   - All admin routes protected with JWT
   - Admin role verified on every request
   
2. **Self-Protection**
   - Admins cannot block themselves
   - Admins cannot delete themselves
   - Admins cannot perform bulk actions on themselves
   
3. **Data Validation**
   - All inputs validated
   - Prevents SQL injection
   - Sanitizes user input
   
4. **Access Control**
   - Non-admins cannot access admin routes
   - Returns 403 Forbidden for unauthorized access

## Database Models

### User Model
```javascript
{
  status: "active" | "restricted" | "blocked" | "suspended",
  restrictions: {
    canConnect: Boolean,
    canChat: Boolean,
    canTeach: Boolean,
    canLearn: Boolean
  },
  adminNotes: String,
  warningCount: Number,
  lastWarningDate: Date
}
```

### Complaint Model
```javascript
{
  complainant: ObjectId,
  reportedUser: ObjectId,
  subject: String,
  description: String,
  category: String,
  status: "pending" | "under_review" | "resolved" | "dismissed",
  resolution: String,
  priority: "low" | "medium" | "high" | "urgent",
  adminNotes: String,
  handledBy: ObjectId,
  complainantEmail: String
}
```

## Usage Guide

### For Users

1. **Reporting Another User**
   - Navigate to the user's profile
   - Click "Report User" button
   - Fill in complaint form
   - Submit complaint

2. **What Happens After Reporting**
   - Admin receives notification
   - Complaint is reviewed
   - Admin takes appropriate action
   - Status updated in system

### For Admins

1. **Accessing Admin Dashboard**
   - Login with admin credentials
   - Navigate to `/admin/complaints`
   - View all complaints

2. **Reviewing Complaints**
   - Click on any complaint to view details
   - See user information and status
   - Check warning history
   - Read complaint details

3. **Taking Action**
   - Select appropriate action:
     - **Warning** - Record warning, user stays active
     - **Restrict** - Limit user abilities
     - **Block** - Prevent platform access
     - **Suspend** - Temporary block
     - **Dismiss** - Close complaint without action
   - Add admin notes explaining decision
   - Click "Execute Action"

4. **Managing Users**
   - Use admin API endpoints
   - View user statistics
   - Bulk actions for multiple users
   - Review complaint history

## Testing

### Test Scenarios

1. **Create Admin User**
   ```bash
   cd learn-share-frontend/server
   node createAdmin.js
   ```

2. **Submit Test Complaint**
   - Login as regular user
   - Report another user
   - Check admin dashboard

3. **Block User**
   - Login as admin
   - View complaint
   - Select "Block User"
   - Execute action
   - Try logging in as blocked user (should fail)

4. **Issue Warning**
   - Login as admin
   - View complaint
   - Select "Issue Warning"
   - Check user's warning count

## Environment Variables

Required in `.env`:
```
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
FRONTEND_URL=http://localhost:5173
```

## API Response Examples

### Successful Complaint Submission
```json
{
  "success": true,
  "message": "Complaint submitted successfully. Admin will review it shortly.",
  "complaintId": "507f1f77bcf86cd799439011"
}
```

### User Blocked
```json
{
  "success": true,
  "message": "User blocked successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "status": "blocked",
    "restrictions": {
      "canConnect": false,
      "canChat": false,
      "canTeach": false,
      "canLearn": false
    }
  }
}
```

### Login Attempt by Blocked User
```json
{
  "blocked": true,
  "message": "Your account has been blocked. Please contact support."
}
```

## Best Practices

1. **Review Before Action**
   - Always review complaint details thoroughly
   - Check user's history
   - Consider warning count

2. **Document Decisions**
   - Add clear admin notes
   - Explain reasoning for actions
   - Keep audit trail

3. **Graduated Response**
   - First offense: Warning
   - Second offense: Restriction
   - Severe/repeated: Block
   - Temporary issues: Suspend

4. **Regular Monitoring**
   - Check pending complaints daily
   - Review high priority immediately
   - Follow up on resolved cases

## Troubleshooting

### Admin Can't Access Dashboard
- Verify user has `role: "admin"` in database
- Check JWT token is valid
- Ensure admin is not blocked

### Emails Not Sending
- Check EMAIL_USER and EMAIL_PASS in .env
- Verify Gmail app password is correct
- Check console for OTP if email fails

### Actions Not Working
- Verify admin authentication
- Check console for errors
- Ensure user ID is valid
- Confirm admin has proper permissions

## Future Enhancements

Potential improvements:
- Email notifications to affected users
- Appeal system for blocked users
- Activity logs for admin actions
- Advanced filtering and search
- Export complaint reports
- Analytics dashboard
- Automated actions based on warning count
- User reputation system

## Support

For issues or questions:
- Check console logs for errors
- Review this documentation
- Test with sample data
- Verify environment variables
