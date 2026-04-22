# Firebase Setup Guide for Expense Tracker

This guide will help you set up Firebase Firestore and Authentication for the Expense Tracker application.

## Prerequisites

- A Google account
- Node.js and npm installed
- The Expense Tracker project set up locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "expense-tracker-app")
4. Accept the terms and create the project
5. Wait for the project to be created

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** (in left menu under "Build")
2. Click **Get started** or **Sign-in method**
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Enable "Email link (passwordless sign-in)" if desired
   - Click "Save"

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database** (in left menu under "Build")
2. Click **Create database**
3. Choose your database location (preferably close to your users)
4. Start in **Production mode** (we'll update security rules later)
5. Click **Create**

## Step 4: Set Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace the default rules with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - authenticated users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Transactions collection - authenticated users can read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Categories collection - authenticated users can read/write their own categories
    match /categories/{categoryId} {
      allow read, write: if request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Budgets collection - authenticated users can read/write their own budgets
    match /budgets/{budgetId} {
      allow read, write: if request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **Publish**

## Step 5: Get Your Firebase Configuration

1. In Firebase Console, click **Project Settings** (gear icon)
2. Go to **General** tab
3. Under "Your apps", find your web app or create one by clicking the **</> Web** icon
4. Copy the Firebase configuration object

## Step 6: Add Firebase Config to Angular App

1. Open `src/app/app.config.ts`
2. Replace the `firebaseConfig` object with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 7: Create Firestore Collections

You can create the collections manually through Firebase Console:

### Collections to Create:

1. **users** - Store user profiles and settings
   ```
   id: string (user ID)
   displayName: string
   email: string
   budget: number
   createdAt: timestamp
   updatedAt: timestamp
   ```

2. **transactions** - Store all transactions (income and expenses)
   ```
   id: string (auto-generated)
   userId: string (user ID)
   title: string
   amount: number
   category: string
   categoryId: string
   type: string (income | expense)
   date: timestamp
   notes: string (optional)
   createdAt: timestamp
   updatedAt: timestamp
   ```

3. **categories** - Store user-defined categories
   ```
   id: string (auto-generated)
   userId: string (user ID)
   name: string
   icon: string
   color: string
   isDefault: boolean
   createdAt: timestamp
   ```

4. **budgets** - Store budget limits per category
   ```
   id: string (auto-generated)
   userId: string (user ID)
   categoryId: string
   categoryName: string
   limit: number
   period: string (monthly | yearly)
   createdAt: timestamp
   updatedAt: timestamp
   ```

## Step 8: Test the Application

1. Run the development server:
   ```bash
   npm start
   ```

2. Navigate to `http://localhost:4200`

3. You should see the login page. Try registering a new account.

4. Once logged in, you should be able to:
   - Add transactions
   - View the dashboard with charts
   - Manage budgets
   - Filter and search transactions

## Troubleshooting

### Authentication Issues
- Make sure Email/Password authentication is enabled in Firebase
- Check that the authentication providers are properly configured

### Firestore Permission Denied
- Verify the security rules are correctly published
- Check that the user is authenticated
- Ensure the `userId` field is properly set when creating documents

### Data Not Loading
- Check Firebase Console for errors
- Verify the Firestore collection names match the code
- Ensure the security rules allow read/write access

### CORS Issues
- Firebase handles CORS automatically, but ensure you're using the correct domain in Firebase Console

## Deploying to Production

### Firebase Hosting (Optional)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init hosting
   ```

4. Build the Angular app:
   ```bash
   npm run build
   ```

5. Deploy:
   ```bash
   firebase deploy
   ```

### Production Security Considerations

1. **Upgrade Security Rules**: The provided rules are for development. For production:
   - Add rate limiting
   - Add data validation
   - Consider implementing custom claims for admin users
   - Add backup and restore strategies

2. **Enable Additional Authentication Methods**:
   - Google OAuth
   - GitHub OAuth
   - Phone authentication

3. **Set Up Monitoring**:
   - Enable Firebase Performance Monitoring
   - Set up Cloud Logging
   - Configure alerts

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Angular Fire Documentation](https://github.com/angular/angularfire)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
