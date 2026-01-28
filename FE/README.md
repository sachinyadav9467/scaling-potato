# Assignment Submitter App

A single-user assignment management app that helps students plan, execute, and submit assignments across multiple subjects with strong time-based navigation and tutor/teacher oversight.

## Features

- **Multiple Views**: Daily, Weekly, Monthly, and Tabular views
- **Role-Based Access**: Student and Tutor roles with different permissions
- **Assignment Scheduling**: One-time, Daily, Weekly, and Monthly recurring assignments
- **Subject Management**: Organize assignments by subjects with color coding
- **Submission Tracking**: Track submission status and receive feedback
- **Metrics & Analytics**: Daily, weekly, monthly, and custom range metrics
- **Mobile-First UI**: Responsive design optimized for all devices
- **Time Navigation**: Easy navigation between days, weeks, and months
- **Export Functionality**: Export assignment data to CSV

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will automatically open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  │   ├── AssignmentCard.jsx
  │   ├── Layout.jsx
  │   ├── MetricsCard.jsx
  │   └── SubjectCard.jsx
  ├── views/          # Main view components
  │   ├── DailyView.jsx
  │   ├── WeeklyView.jsx
  │   ├── MonthlyView.jsx
  │   └── TabularView.jsx
  ├── context/        # React context for state management
  │   └── AppContext.jsx
  ├── utils/          # Utility functions
  │   ├── data.js          # Mock data and data operations
  │   ├── dateUtils.js     # Date manipulation utilities
  │   └── metrics.js        # Metrics calculation functions
  ├── types/          # Type definitions and constants
  │   └── index.js
  └── styles/         # Global styles
      └── index.css
```

## User Roles

### Student
- View assignments and schedules
- Submit assignments (text, file, or link)
- Edit submissions
- View metrics and progress
- Navigate between days/weeks/months

### Tutor/Teacher
- All student capabilities
- Create and schedule assignments
- Add and manage subjects
- Review submissions
- Provide feedback and scores
- View comprehensive metrics

## Views

### Daily View (Default)
- Shows all assignments for the selected day
- Grouped by subject
- Quick day navigation
- Daily metrics overview
- Subject preview cards

### Weekly View
- 7-day grid layout
- Assignment density visualization
- Subject color coding
- Weekly metrics and workload analysis

### Monthly View
- Calendar heatmap showing assignment density
- Completion trends
- Subject difficulty index
- Monthly consistency score

### Tabular View
- Comprehensive table of all assignments
- Advanced filtering (subject, status, type)
- Search functionality
- CSV export capability
- Detailed assignment information

## Technology Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **date-fns** - Date manipulation library
- **lucide-react** - Icon library

## Data Storage

Currently, the app uses in-memory mock data. In a production environment, you would replace the functions in `src/utils/data.js` with API calls to your backend.

## Customization

### Adding Subjects
Subjects can be added by modifying the `subjects` array in `src/utils/data.js` or by implementing the subject creation UI (for tutors).

### Assignment Types
The app supports four assignment types:
- **One-time**: Single assignment with specific dates
- **Daily**: Recurring daily assignment
- **Weekly**: Recurring on specific days of the week
- **Monthly**: Recurring monthly assignment

### Styling
The app uses Tailwind CSS. Customize colors and styles in `tailwind.config.js` or by modifying the component classes.

## Future Enhancements

- Backend API integration
- User authentication
- Persistent data storage
- Notifications and reminders
- AI scheduling suggestions
- Multi-student support
- LMS integrations
