# Video & Design Architecture Review

## Core Requirements

1. **Daily Videos per Course**: Each course should have videos organized by date (daily videos)
2. **Notes per Video**: Each video should have attached notes/files
3. **LearnFlow Design**: Modern design matching the screenshot style

## Current State Issues

### Database Schema Issues
- ❌ `Course.videoUrls` is just a JSON array of URLs - no date association
- ❌ `Course.attachments` is just a JSON array - not linked to specific videos
- ❌ No way to track which video belongs to which date
- ❌ No way to track video watching progress
- ❌ No way to associate notes with specific videos

### Frontend Issues
- ❌ No "Daily Videos" view (only Daily/Weekly/Monthly for assignments)
- ❌ Videos are just displayed as a list in CourseDetailModal
- ❌ No video player integration
- ❌ No notes display/management per video
- ❌ Design doesn't match LearnFlow style (header, navigation, metrics cards)

## Required Changes

### 1. Database Schema Changes

#### 1.1 Create Video Model
**File: `BE/prisma/schema.prisma`**

```prisma
model Video {
  id          String      @id @default(uuid())
  courseId   String      @map("course_id")
  date       DateTime    @db.Date  // Which day this video is for
  title      String
  videoUrl   String      @map("video_url")
  duration   Int?        // Duration in seconds
  watched    Boolean     @default(false)
  watchedAt  DateTime?   @map("watched_at")
  notes      VideoNote[] // Notes attached to this video
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  course     Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, date]) // One video per course per day
  @@index([courseId])
  @@index([date])
  @@map("videos")
}

model VideoNote {
  id          String      @id @default(uuid())
  videoId     String      @map("video_id")
  title       String
  fileUrl     String      @map("file_url")  // URL to the notes file
  fileName    String      @map("file_name")  // Original filename
  fileSize    Int?        @map("file_size")  // Size in bytes
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  video       Video       @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@index([videoId])
  @@map("video_notes")
}
```

#### 1.2 Update Course Model
**File: `BE/prisma/schema.prisma`**

```prisma
model Course {
  // ... existing fields ...
  videos      Video[]     // Add this relation
  // Remove: videoUrls and attachments (replaced by Video model)
}
```

### 2. Backend API Changes

#### 2.1 Create Video Routes
**New File: `BE/src/routes/videos.js`**

```javascript
// GET /api/v1/videos?courseId=xxx&date=2026-01-19
// GET /api/v1/videos/:videoId
// POST /api/v1/videos
// PATCH /api/v1/videos/:videoId
// DELETE /api/v1/videos/:videoId
// PATCH /api/v1/videos/:videoId/watched (mark as watched)
```

#### 2.2 Create Video Notes Routes
**New File: `BE/src/routes/videoNotes.js`**

```javascript
// GET /api/v1/videos/:videoId/notes
// POST /api/v1/videos/:videoId/notes
// DELETE /api/v1/video-notes/:noteId
```

#### 2.3 Update Courses Routes
**File: `BE/src/routes/courses.js`**

- Remove `videoUrls` and `attachments` from Course model
- Add video count/statistics to course responses

### 3. Frontend Architecture Changes

#### 3.1 Create Daily Videos View
**New File: `FE/src/views/DailyVideosView.jsx`**

**Features:**
- Show videos for selected date
- Group by course
- Video player integration
- Notes display/download
- Mark as watched functionality
- Progress tracking

**Structure:**
```jsx
<DailyVideosView>
  <DateNavigator />
  <VideoMetrics />  // Videos watched, total videos, etc.
  <CourseVideoList />  // Grouped by course
    <CourseSection>
      <VideoCard />
        <VideoPlayer />
        <VideoNotes />
        <WatchButton />
    </CourseSection>
  </CourseVideoList>
</DailyVideosView>
```

#### 3.2 Create Video Components
**New Directory: `FE/src/components/videos/`**

- `VideoCard.jsx` - Card displaying video info
- `VideoPlayer.jsx` - Video player component
- `VideoNotes.jsx` - Display/download notes
- `VideoList.jsx` - List of videos
- `VideoMetrics.jsx` - Metrics for videos (watched count, etc.)
- `AddVideoModal.jsx` - Add new video
- `EditVideoModal.jsx` - Edit video details

#### 3.3 Update Navigation
**File: `FE/src/components/Layout.jsx`**

Change navigation to match LearnFlow:
- "Daily Videos" (with video icon) - NEW
- "Weekly Tasks" (with calendar icon) - rename from "Weekly"
- "Student" / "Teacher" - role-based views

#### 3.4 Update Header Design
**File: `FE/src/components/Layout.jsx`**

Match LearnFlow header:
- Logo (teal square with book icon)
- App name: "LearnFlow"
- Tagline: "Daily Learning Tracker"
- Welcome message: "Welcome back!" / "Keep up the great work"
- User avatar with initial

#### 3.5 Update Metrics Cards Design
**File: `FE/src/components/MetricsCard.jsx`**

Match LearnFlow metrics:
- Individual metric cards with icons
- Large numbers (e.g., "0/0", "2/2")
- Progress bars where applicable
- Color-coded (green for success, orange for pending, etc.)

**Metrics for Daily Videos View:**
- Videos Watched: "X/Y" with video icon
- Learning Progress: "X%" with checkmark icon
- Pending Videos: "X" with graph icon

**Metrics for Weekly Tasks View:**
- Submitted: "X/Y" with document icon
- Learning Progress: "X%" with checkmark icon
- Pending Tasks: "X" with graph icon

#### 3.6 Update Assignment Cards Design
**File: `FE/src/components/AssignmentCard.jsx`**

Match LearnFlow style:
- Course tag at top (pill-shaped with course color)
- Better spacing and typography
- Teacher feedback display (if reviewed)
- Score display (e.g., "Score: 95/100")
- Submission date display
- Attachment count display
- "View Submission" button

#### 3.7 Update Course Cards Design
**File: `FE/src/components/CourseCard.jsx`**

Match LearnFlow style:
- Better visual hierarchy
- Course icon/color more prominent
- Progress indicators
- Video count display
- Assignment count display

### 4. Context/State Management Changes

#### 4.1 Add Video State
**File: `FE/src/context/AppContext.jsx`**

Add:
```javascript
const [videos, setVideos] = useState([]);
const [videoNotes, setVideoNotes] = useState({}); // {videoId: [notes]}

// Functions
const getVideosForDate = async (date) => { ... };
const getVideosForCourse = async (courseId) => { ... };
const markVideoAsWatched = async (videoId) => { ... };
const addVideo = async (videoData) => { ... };
const addVideoNote = async (videoId, noteData) => { ... };
```

### 5. API Service Changes

#### 5.1 Add Video API
**File: `FE/src/services/api.js`**

Add:
```javascript
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.patch(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
  markWatched: (id) => api.patch(`/videos/${id}/watched`),
  getNotes: (videoId) => api.get(`/videos/${videoId}/notes`),
  addNote: (videoId, data) => api.post(`/videos/${videoId}/notes`, data),
  deleteNote: (noteId) => api.delete(`/video-notes/${noteId}`),
};
```

### 6. Design System Updates

#### 6.1 Color Palette
Match LearnFlow colors:
- Primary: Teal/Green (#14B8A6 or similar)
- Secondary: Orange (#F97316 or similar)
- Success: Green
- Warning: Yellow/Orange
- Background: Light gray (#F9FAFB)

#### 6.2 Typography
- App name: Large, bold, dark gray
- Tagline: Smaller, light gray
- Metrics: Large numbers (2xl or 3xl)
- Cards: Clean, rounded corners, subtle shadows

#### 6.3 Component Styles
- Navigation: Pill-shaped tabs with icons
- Cards: White background, rounded, subtle border
- Buttons: Rounded, with hover states
- Badges: Pill-shaped, color-coded

## Implementation Checklist

### Phase 1: Database & Backend
- [ ] Create Video model in Prisma schema
- [ ] Create VideoNote model in Prisma schema
- [ ] Remove videoUrls and attachments from Course model
- [ ] Run database migration
- [ ] Create video routes (CRUD operations)
- [ ] Create video notes routes
- [ ] Update courses routes
- [ ] Add video watching tracking

### Phase 2: Frontend Core
- [ ] Create DailyVideosView component
- [ ] Create video components (VideoCard, VideoPlayer, VideoNotes)
- [ ] Add video API service
- [ ] Update AppContext with video state
- [ ] Create video metrics component

### Phase 3: Design Updates
- [ ] Update Layout/Header to match LearnFlow
- [ ] Update navigation (Daily Videos, Weekly Tasks)
- [ ] Update metrics cards design
- [ ] Update assignment cards design
- [ ] Update course cards design
- [ ] Apply LearnFlow color scheme
- [ ] Update typography

### Phase 4: Integration
- [ ] Integrate video player (react-player or similar)
- [ ] Add file upload for video notes
- [ ] Add video watching progress tracking
- [ ] Update weekly view to show both videos and tasks
- [ ] Add video statistics to metrics

### Phase 5: Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Add animations
- [ ] Responsive design
- [ ] Accessibility improvements

## File Structure After Changes

```
FE/src/
  ├── views/
  │   ├── DailyVideosView.jsx      # NEW - Daily videos view
  │   ├── DailyView.jsx            # Keep for assignments
  │   ├── WeeklyView.jsx           # Show both videos & tasks
  │   └── ...
  ├── components/
  │   ├── videos/                   # NEW
  │   │   ├── VideoCard.jsx
  │   │   ├── VideoPlayer.jsx
  │   │   ├── VideoNotes.jsx
  │   │   ├── VideoList.jsx
  │   │   ├── VideoMetrics.jsx
  │   │   ├── AddVideoModal.jsx
  │   │   └── EditVideoModal.jsx
  │   ├── Layout.jsx               # Updated design
  │   ├── MetricsCard.jsx          # Updated design
  │   ├── AssignmentCard.jsx       # Updated design
  │   └── CourseCard.jsx            # Updated design
  └── services/
      └── api.js                    # Add videosAPI
```

## Key Design Elements from Screenshots

1. **Header**: Teal logo square, "LearnFlow" name, tagline, welcome message, avatar
2. **Navigation**: Pill-shaped tabs with icons (Daily Videos, Weekly Tasks, Student, Teacher)
3. **Metrics**: Individual cards with icons, large numbers, progress bars
4. **Course Tags**: Pill-shaped with course color and icon
5. **Assignment Cards**: Clean design with course tag, status badge, teacher feedback, score
6. **Week View**: "Week 4" with date range, navigation arrows, "This Week" button

## Next Steps

1. Start with database schema changes
2. Create backend video API
3. Create Daily Videos view
4. Update design to match LearnFlow
5. Integrate video player
6. Add notes functionality
