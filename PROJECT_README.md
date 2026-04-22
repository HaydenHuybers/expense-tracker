# Enhanced Expense Tracker Application

A modern, feature-rich expense tracking web application built with Angular 21, Firebase, and Angular Material. This application helps users manage personal finances through CRUD operations, analytics, budgeting, and smart filtering.

## 🎯 Features Implemented

### 1. User Management ✅
- **User Registration**: Email/password registration with validation
- **User Login**: Secure authentication using Firebase Auth
- **Profile Management**: User profile stored in Firestore
- **Session Management**: Automatic authentication state management

### 2. Expense & Income Tracking ✅
- **Add Transactions**: Create income and expense records
- **Edit Transactions**: Modify existing transaction details
- **Delete Transactions**: Remove unwanted transactions
- **Transaction Fields**:
  - Amount (with validation)
  - Category (predefined and extensible)
  - Date (with date picker)
  - Notes (optional)
  - Type (Income/Expense)
  - Automatic timestamps

### 3. Categories Management ✅
- **Predefined Categories**: Food, Rent, Travel, Shopping, Utilities, Entertainment, Healthcare, Education, Work, Personal, Grocery
- **Category-based Filtering**: Filter transactions by category
- **Extensible Design**: Ready for user-defined categories

### 4. Dashboard & Analytics ✅
- **Key Metrics**:
  - Total Income (green-highlighted)
  - Total Expense (red-highlighted)
  - Net Balance (blue-highlighted)
- **Visual Charts**:
  - Pie Chart: Category-wise spending distribution
  - Bar Chart: Income vs Expense comparison
- **Recent Transactions**: Table showing latest 5 transactions
- **Real-time Updates**: Charts and data update as transactions change

### 5. Budget Planning ✅
- **Set Budgets**: Define monthly budgets per category
- **Budget Tracking**: Visual progress bars showing budget utilization
- **Budget Alerts**:
  - ⚠️ Warning at 75% of budget (yellow)
  - 🚨 Exceeded notification when over budget (red)
- **Budget Management**: Update and delete budgets

### 6. Search & Filters ✅
- **Multi-filter Support**:
  - Filter by Transaction Type (Income/Expense)
  - Filter by Category
  - Search by Description, Category, or Notes
- **Real-time Filtering**: Instant results as filters change
- **Clear Filters**: One-click reset of all filters
- **Combined Filters**: Multiple filters work together (AND logic)

## 🏗️ Technical Architecture

### Frontend
- **Framework**: Angular 21 (Standalone Components)
- **State Management**: Angular Signals + Computed Properties
- **Forms**: Reactive Forms with comprehensive validation
- **UI Library**: Angular Material
- **Charts**: Chart.js with ng2-charts
- **Routing**: Protected routes with Auth Guards
- **Change Detection**: OnPush strategy for performance

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time Updates**: Firestore Snapshots

### Database Schema

```
Firestore Collections:
├── users/
│   └── {userId}
│       ├── displayName: string
│       ├── email: string
│       ├── budget: number
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
├── transactions/
│   └── {transactionId}
│       ├── userId: string
│       ├── title: string
│       ├── amount: number
│       ├── category: string
│       ├── type: "income" | "expense"
│       ├── date: timestamp
│       ├── notes: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
├── categories/
│   └── {categoryId}
│       ├── userId: string
│       ├── name: string
│       ├── icon: string
│       ├── color: string
│       ├── isDefault: boolean
│       └── createdAt: timestamp
└── budgets/
    └── {budgetId}
        ├── userId: string
        ├── categoryId: string
        ├── categoryName: string
        ├── limit: number
        ├── period: "monthly" | "yearly"
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── add-expense/
│   │   │   ├── edit-expense/
│   │   │   ├── expense-list/
│   │   │   └── expense-item/
│   │   ├── services/
│   │   │   ├── auth-service.ts
│   │   │   ├── firestore-service.ts
│   │   │   └── expense-service.ts (legacy)
│   │   ├── models/
│   │   │   └── expense.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app-routing.ts
│   │   └── app.ts
│   ├── main.ts
│   ├── index.html
│   └── styles.css
├── angular.json
├── package.json
├── tsconfig.json
├── FIREBASE_SETUP.md
├── AI_USAGE_DOCUMENTATION.md
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v21)
- Firebase account

### Installation

1. **Clone or Download the Project**
   ```bash
   cd expense-tracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Firebase**
   - Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Update `src/app/app.config.ts` with your Firebase configuration

4. **Start Development Server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔐 Security Features

- **Route Guards**: Protected routes require authentication
- **Firestore Rules**: User-based access control
- **Input Validation**: Comprehensive form validation
- **Error Handling**: User-friendly error messages
- **HTTPS**: Firebase automatically provides HTTPS

## 📊 UI/UX Design

### Dashboard Layout
- **Header**: Navigation and quick actions
- **Stats Cards**: Key financial metrics at a glance
- **Charts**: Visual representation of spending patterns
- **Budget Section**: Real-time budget status
- **Recent Transactions**: Quick access to latest activity

### Responsive Design
- **Desktop**: Multi-column layouts
- **Tablet**: Optimized 2-column grids
- **Mobile**: Single-column stacked layout

### Material Design
- Consistent color scheme (Green for income, Red for expense, Blue for balance)
- Intuitive form fields and buttons
- Smooth transitions and animations
- Accessibility best practices (WCAG AA compliant)

## 🎓 Learning Resources Used

### AI-Assisted Development
This project demonstrates the use of AI tools in the development process:

1. **Requirement Generation**: User story creation
2. **UI/UX Design**: Dashboard layout design
3. **Code Assistance**: Service creation, form validation, and component structure

See [AI_USAGE_DOCUMENTATION.md](./AI_USAGE_DOCUMENTATION.md) for detailed prompts and explanations.

## 🧪 Testing Recommendations

### Manual Testing Checklist
- [ ] User can register with valid email/password
- [ ] User can login with registered credentials
- [ ] Dashboard loads with correct statistics
- [ ] User can add expense/income transactions
- [ ] User can edit existing transactions
- [ ] User can delete transactions
- [ ] Charts update in real-time
- [ ] Filters work correctly (type, category, search)
- [ ] Budget alerts display correctly
- [ ] Recent transactions table shows latest 5 items
- [ ] Logout works and redirects to login
- [ ] Protected routes are secured

### Potential Bug Fixes
- Ensure Material imports use correct module paths
- Verify Firebase config is properly set
- Check console for any TypeScript errors
- Validate form inputs work correctly

## 📚 Dependencies

```json
{
  "@angular/core": "^21.2.0",
  "@angular/fire": "^20.0.1",
  "@angular/material": "^21.2.7",
  "@angular/forms": "^21.2.0",
  "@angular/router": "^21.2.0",
  "firebase": "^12.12.1",
  "chart.js": "^4.5.1",
  "ng2-charts": "^10.0.0"
}
```

## 🔧 Configuration

### Firebase Configuration
Update `src/app/app.config.ts`:
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

## 📝 API Documentation

### AuthService
- `register(email, password, displayName)`: Create new user
- `login(email, password)`: Authenticate user
- `logout()`: Sign out user
- `currentUser()`: Get logged-in user signal

### FirestoreService
- `addTransaction(transaction)`: Create transaction
- `updateTransaction(id, updates)`: Modify transaction
- `deleteTransaction(id)`: Remove transaction
- `addBudget(budget)`: Create budget
- `updateBudget(id, updates)`: Modify budget
- `deleteBudget(id)`: Remove budget

### Computed Properties
- `totalIncome`: Sum of all income
- `totalExpense`: Sum of all expenses
- `netBalance`: Income - Expense
- `spendingByCategory`: Spending breakdown
- `dashboardStats`: Aggregated dashboard data

## 🚀 Future Enhancements

1. **OAuth Integration**: Google/GitHub login
2. **Data Export**: CSV/PDF export functionality
3. **Recurring Transactions**: Automatic recurring expenses
4. **Multiple Currencies**: Multi-currency support
5. **Mobile App**: React Native or Flutter version
6. **Advanced Analytics**: Monthly trends, predictions
7. **Notifications**: Push notifications for budget alerts
8. **Data Backup**: Automatic backup and restore
9. **Tags**: Additional organization with tags
10. **Sharing**: Family budget sharing features

## 📄 License

This project is provided for educational purposes.

## ✨ Key Learnings

- **Modern Angular**: Standalone components, Signals, and control flow
- **Firebase**: Real-time database and authentication
- **Reactive Forms**: Advanced form validation and handling
- **Material Design**: Professional UI components
- **TypeScript**: Strong typing and interfaces
- **State Management**: Using Signals and Computed properties
- **Data Security**: Firestore security rules

## 📞 Support

For issues or questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration
2. Review [AI_USAGE_DOCUMENTATION.md](./AI_USAGE_DOCUMENTATION.md) for implementation details
3. Check the Console for error messages
4. Review Firestore security rules

## 🎉 Thank You

This project was developed as an exercise in modern web development using AI-assisted coding tools and best practices in Angular application development.

---

**Last Updated**: April 2026  
**Angular Version**: 21.2.0  
**Node Version**: 18.x or higher
