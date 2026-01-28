# Design Architecture Review & Refactoring Plan

## Current State Analysis

### Current Architecture Issues:
1. **No Design System**: Components use inline Tailwind classes without a consistent design system
2. **Inconsistent Component Structure**: Each component has its own styling approach
3. **Limited Reusability**: UI patterns are duplicated across components
4. **No Theme Management**: Colors, spacing, and typography are hardcoded
5. **Basic Layout Structure**: Simple header/nav/main layout without sophisticated design patterns
6. **No Component Library**: Missing foundational UI components (buttons, cards, badges, etc.)

## Required Architectural Changes

### 1. Design System Foundation

#### 1.1 Create Design Tokens System
**Files to Create:**
- `FE/src/design-system/tokens.js` - Color palette, typography, spacing, shadows
- `FE/src/design-system/theme.js` - Theme configuration
- `FE/src/design-system/breakpoints.js` - Responsive breakpoints

**Changes:**
- Define color palette (primary, secondary, success, warning, error, neutral)
- Typography scale (font families, sizes, weights, line heights)
- Spacing scale (consistent spacing units)
- Shadow system (elevation levels)
- Border radius system
- Animation/transition system

#### 1.2 Create Tailwind Configuration
**Files to Create/Modify:**
- `FE/tailwind.config.js` - Extended Tailwind config with design tokens

**Changes:**
- Extend Tailwind with custom colors from design tokens
- Custom spacing scale
- Custom typography scale
- Custom shadow system
- Custom animation system

### 2. Component Architecture Refactoring

#### 2.1 Create Base UI Component Library
**New Directory Structure:**
```
FE/src/components/ui/
  - Button/
    - Button.jsx
    - Button.styles.js
    - index.js
  - Card/
    - Card.jsx
    - CardHeader.jsx
    - CardBody.jsx
    - CardFooter.jsx
    - Card.styles.js
    - index.js
  - Badge/
    - Badge.jsx
    - Badge.styles.js
    - index.js
  - Avatar/
    - Avatar.jsx
    - Avatar.styles.js
    - index.js
  - ProgressBar/
    - ProgressBar.jsx
    - ProgressBar.styles.js
    - index.js
  - Icon/
    - Icon.jsx
    - Icon.styles.js
    - index.js
  - Input/
    - Input.jsx
    - Textarea.jsx
    - Select.jsx
    - Input.styles.js
    - index.js
  - Modal/
    - Modal.jsx
    - ModalHeader.jsx
    - ModalBody.jsx
    - ModalFooter.jsx
    - Modal.styles.js
    - index.js
  - Tabs/
    - Tabs.jsx
    - Tab.jsx
    - Tabs.styles.js
    - index.js
  - EmptyState/
    - EmptyState.jsx
    - EmptyState.styles.js
    - index.js
```

**Changes:**
- Extract common UI patterns into reusable components
- Implement variant system (size, color, style variants)
- Add proper TypeScript/PropTypes
- Create consistent API across all components

#### 2.2 Refactor Layout Components
**Files to Modify:**
- `FE/src/components/Layout.jsx` → `FE/src/components/layout/AppLayout.jsx`
- Create `FE/src/components/layout/Header.jsx`
- Create `FE/src/components/layout/Navigation.jsx`
- Create `FE/src/components/layout/Sidebar.jsx` (optional)

**Changes:**
- Modern header with branding (logo, app name, tagline)
- Improved navigation with better visual hierarchy
- User profile section with avatar
- Better responsive behavior
- Sticky header/navigation

### 3. Feature Component Refactoring

#### 3.1 Refactor Assignment Components
**Files to Modify:**
- `FE/src/components/AssignmentCard.jsx` → `FE/src/components/assignments/AssignmentCard.jsx`
- Create `FE/src/components/assignments/AssignmentList.jsx`
- Create `FE/src/components/assignments/AssignmentGroup.jsx` (group by course/date)
- Create `FE/src/components/assignments/AssignmentStatusBadge.jsx`
- Create `FE/src/components/assignments/SubmissionForm.jsx`

**Changes:**
- Better visual hierarchy
- Improved status indicators
- Better submission UI
- Teacher feedback display
- Score/grade display
- Attachment handling UI

#### 3.2 Refactor Course Components
**Files to Modify:**
- `FE/src/components/CourseCard.jsx` → `FE/src/components/courses/CourseCard.jsx`
- Create `FE/src/components/courses/CourseList.jsx`
- Create `FE/src/components/courses/CourseHeader.jsx`
- Create `FE/src/components/courses/CourseProgress.jsx`

**Changes:**
- Better course card design
- Progress visualization
- Course statistics display
- Better course detail modal

#### 3.3 Refactor Metrics Components
**Files to Modify:**
- `FE/src/components/MetricsCard.jsx` → `FE/src/components/metrics/MetricsCard.jsx`
- Create `FE/src/components/metrics/MetricCard.jsx` (single metric)
- Create `FE/src/components/metrics/MetricsGrid.jsx`
- Create `FE/src/components/metrics/ProgressIndicator.jsx`

**Changes:**
- Individual metric cards with icons
- Better visual representation
- Progress bars and charts
- Animated counters
- Better color coding

### 4. View Architecture Refactoring

#### 4.1 Refactor View Components
**Files to Modify:**
- `FE/src/views/DailyView.jsx`
- `FE/src/views/WeeklyView.jsx`
- `FE/src/views/MonthlyView.jsx`
- `FE/src/views/TabularView.jsx`

**New Structure:**
```
FE/src/views/
  - daily/
    - DailyView.jsx
    - DailyHeader.jsx
    - DailyContent.jsx
    - DailySidebar.jsx (optional)
  - weekly/
    - WeeklyView.jsx
    - WeeklyHeader.jsx
    - WeeklyCalendar.jsx
    - WeeklyMetrics.jsx
  - monthly/
    - MonthlyView.jsx
    - MonthlyHeader.jsx
    - MonthlyCalendar.jsx
    - MonthlyMetrics.jsx
  - shared/
    - ViewHeader.jsx
    - DateNavigator.jsx
    - FilterBar.jsx
```

**Changes:**
- Break down large view components into smaller, focused components
- Extract common patterns (headers, navigation, filters)
- Better component composition
- Improved loading states
- Better empty states

### 5. Styling Architecture

#### 5.1 Create Styled Components System
**Files to Create:**
- `FE/src/styles/theme.js` - Theme provider
- `FE/src/styles/global.css` - Global styles
- `FE/src/styles/components.css` - Component-specific styles
- `FE/src/styles/utilities.css` - Utility classes

**Changes:**
- CSS custom properties for theming
- Consistent spacing system
- Typography system
- Color system
- Animation system

#### 5.2 Create Utility Functions
**Files to Create:**
- `FE/src/utils/styles.js` - Style utility functions
- `FE/src/utils/classNames.js` - Class name utilities
- `FE/src/utils/variants.js` - Component variant utilities

### 6. State Management Architecture

#### 6.1 Enhance Context Structure
**Files to Modify:**
- `FE/src/context/AppContext.jsx`

**New Structure:**
```
FE/src/context/
  - AppContext.jsx (main context)
  - ThemeContext.jsx (theme management)
  - UIContext.jsx (UI state - modals, sidebars, etc.)
  - FilterContext.jsx (filtering state)
```

**Changes:**
- Separate concerns (data, UI, theme)
- Better state organization
- Performance optimizations (memoization)

### 7. Navigation & Routing Architecture

#### 7.1 Improve Navigation System
**Files to Modify:**
- `FE/src/components/Layout.jsx`
- `FE/src/App.jsx`

**Changes:**
- Better navigation structure
- Active state management
- Breadcrumbs (optional)
- Better mobile navigation
- Navigation animations

### 8. Responsive Design Architecture

#### 8.1 Mobile-First Approach
**Changes:**
- Responsive breakpoints system
- Mobile navigation (hamburger menu)
- Responsive grid systems
- Touch-friendly interactions
- Mobile-optimized components

### 9. Animation & Interaction Architecture

#### 9.1 Animation System
**Files to Create:**
- `FE/src/utils/animations.js`
- `FE/src/styles/animations.css`

**Changes:**
- Page transitions
- Component animations
- Loading animations
- Micro-interactions
- Smooth scrolling

### 10. Accessibility Architecture

#### 10.1 Accessibility Improvements
**Changes:**
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance
- Semantic HTML

## Implementation Priority

### Phase 1: Foundation (High Priority)
1. ✅ Create design tokens system
2. ✅ Set up Tailwind configuration
3. ✅ Create base UI component library (Button, Card, Badge, Avatar)
4. ✅ Refactor Layout components

### Phase 2: Core Components (High Priority)
1. ✅ Refactor Assignment components
2. ✅ Refactor Course components
3. ✅ Refactor Metrics components
4. ✅ Create shared view components

### Phase 3: Views (Medium Priority)
1. ✅ Refactor all view components
2. ✅ Improve navigation
3. ✅ Add responsive design
4. ✅ Add loading/empty states

### Phase 4: Polish (Medium Priority)
1. ✅ Add animations
2. ✅ Improve accessibility
3. ✅ Performance optimizations
4. ✅ Testing

### Phase 5: Advanced Features (Low Priority)
1. ✅ Advanced filtering
2. ✅ Search functionality
3. ✅ Customization options
4. ✅ Advanced analytics

## File Structure After Refactoring

```
FE/src/
  ├── components/
  │   ├── ui/                    # Base UI components
  │   │   ├── Button/
  │   │   ├── Card/
  │   │   ├── Badge/
  │   │   ├── Avatar/
  │   │   ├── ProgressBar/
  │   │   ├── Icon/
  │   │   ├── Input/
  │   │   ├── Modal/
  │   │   ├── Tabs/
  │   │   └── EmptyState/
  │   ├── layout/                # Layout components
  │   │   ├── AppLayout.jsx
  │   │   ├── Header.jsx
  │   │   ├── Navigation.jsx
  │   │   └── Sidebar.jsx
  │   ├── assignments/            # Assignment-related components
  │   │   ├── AssignmentCard.jsx
  │   │   ├── AssignmentList.jsx
  │   │   ├── AssignmentGroup.jsx
  │   │   ├── AssignmentStatusBadge.jsx
  │   │   └── SubmissionForm.jsx
  │   ├── courses/               # Course-related components
  │   │   ├── CourseCard.jsx
  │   │   ├── CourseList.jsx
  │   │   ├── CourseHeader.jsx
  │   │   └── CourseProgress.jsx
  │   ├── metrics/               # Metrics components
  │   │   ├── MetricsCard.jsx
  │   │   ├── MetricCard.jsx
  │   │   ├── MetricsGrid.jsx
  │   │   └── ProgressIndicator.jsx
  │   ├── modals/                # Modal components
  │   │   ├── CourseDetailModal.jsx
  │   │   ├── AddCourseModal.jsx
  │   │   └── AddAssignmentModal.jsx
  │   └── shared/                # Shared components
  │       ├── DateNavigator.jsx
  │       ├── FilterBar.jsx
  │       └── ViewHeader.jsx
  ├── views/
  │   ├── daily/
  │   ├── weekly/
  │   ├── monthly/
  │   └── shared/
  ├── context/
  │   ├── AppContext.jsx
  │   ├── ThemeContext.jsx
  │   ├── UIContext.jsx
  │   └── FilterContext.jsx
  ├── design-system/
  │   ├── tokens.js
  │   ├── theme.js
  │   └── breakpoints.js
  ├── styles/
  │   ├── theme.js
  │   ├── global.css
  │   ├── components.css
  │   ├── utilities.css
  │   └── animations.css
  ├── utils/
  │   ├── styles.js
  │   ├── classNames.js
  │   ├── variants.js
  │   └── animations.js
  └── services/
      └── api.js
```

## Key Design Principles

1. **Consistency**: All components follow the same design patterns
2. **Reusability**: Components are composable and reusable
3. **Accessibility**: All components are accessible
4. **Performance**: Optimized rendering and state management
5. **Maintainability**: Clear structure and documentation
6. **Scalability**: Easy to add new features and components

## Next Steps

1. Review and approve this architecture plan
2. Start with Phase 1 (Foundation)
3. Create design tokens and theme system
4. Build base UI component library
5. Gradually refactor existing components
6. Test and iterate
