# Role-Based Permissions & Access Control

## 1. User Roles

**Important**: A user can have **ONLY ONE role** at a time:
- `student` - Can view and interact with content
- `tutor` (or `teacher`) - Can create and manage content

Users cannot have both roles simultaneously. The role is set during registration and can be changed by an admin (if needed).

## 2. Video Permissions

### Current Schema Issue
The `Video` model doesn't have a `userId` field, which makes it unclear who created the video. We need to clarify ownership.

### Recommended Approach

#### Option A: Teachers Create Videos (Recommended)
**Teachers/Tutors:**
- ✅ CREATE videos for courses they own
- ✅ READ all videos in their courses
- ✅ UPDATE videos in their courses
- ✅ DELETE videos from their courses
- ✅ CREATE/UPDATE/DELETE video notes

**Students:**
- ✅ READ videos (view videos assigned to them)
- ✅ UPDATE `watched` status (mark as watched)
- ❌ CREATE videos
- ❌ UPDATE video details (title, URL, etc.)
- ❌ DELETE videos
- ❌ CREATE/UPDATE/DELETE video notes (notes are teacher-provided)

#### Option B: Students Can Create Personal Videos
If students need to create their own videos for self-study:

**Students:**
- ✅ CREATE videos for courses they're enrolled in
- ✅ READ their own videos
- ✅ UPDATE their own videos
- ✅ DELETE their own videos
- ✅ CREATE/UPDATE/DELETE notes for their own videos

**Schema Change Needed:**
```prisma
model Video {
  id          String      @id @default(uuid())
  courseId   String      @map("course_id")
  userId     String      @map("user_id")  // ADD THIS - who created the video
  date       DateTime    @db.Date
  title      String
  videoUrl   String      @map("video_url")
  // ... rest of fields
  user       User        @relation(fields: [userId], references: [id])
}
```

## 3. Assignment Permissions

### Current Implementation
Based on the schema, `Assignment.userId` indicates the creator.

### Recommended Approach

**Teachers/Tutors:**
- ✅ CREATE assignments for courses they own
- ✅ READ all assignments in their courses
- ✅ UPDATE assignments (title, description, due date, status, feedback, score)
- ✅ DELETE assignments from their courses
- ✅ REVIEW submissions (add feedback, assign scores)

**Students:**
- ✅ READ assignments assigned to them
- ✅ UPDATE assignment status (mark as in_progress, submit)
- ❌ CREATE assignments
- ❌ UPDATE assignment details (title, description, due date)
- ❌ DELETE assignments
- ✅ CREATE submissions (submit work)
- ✅ UPDATE their own submissions (before deadline)
- ✅ DELETE their own submissions (before deadline)

**Note**: Students interact with assignments through **Submissions**, not by modifying the assignment itself.

## 4. Course Permissions

**Teachers/Tutors:**
- ✅ CREATE courses
- ✅ READ their own courses
- ✅ UPDATE their own courses
- ✅ DELETE their own courses

**Students:**
- ✅ READ courses they're enrolled in (if enrollment model exists)
- ✅ READ all courses (if no enrollment model - current implementation)
- ❌ CREATE courses
- ❌ UPDATE courses
- ❌ DELETE courses

## 5. Submission Permissions

**Students:**
- ✅ CREATE submissions for assignments
- ✅ READ their own submissions
- ✅ UPDATE their own submissions (before deadline)
- ✅ DELETE their own submissions (before deadline)

**Teachers/Tutors:**
- ✅ READ all submissions for assignments in their courses
- ✅ UPDATE submissions (add feedback, assign scores)
- ❌ CREATE submissions (students submit, not teachers)
- ❌ DELETE submissions (unless admin)

## 6. Recommended Schema Updates

### Add userId to Video Model
```prisma
model Video {
  id          String      @id @default(uuid())
  courseId   String      @map("course_id")
  userId     String      @map("user_id")  // ADD: Creator of the video
  date       DateTime    @db.Date
  title      String
  videoUrl   String      @map("video_url")
  duration   Int?
  watched    Boolean     @default(false)
  watchedAt  DateTime?   @map("watched_at")
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  course     Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  notes      VideoNote[]

  @@unique([courseId, date, userId]) // Allow multiple videos per course per day if different users
  @@index([courseId])
  @@index([userId])
  @@index([date])
  @@map("videos")
}
```

### Add userId to VideoNote (if students can add notes)
```prisma
model VideoNote {
  id          String      @id @default(uuid())
  videoId     String      @map("video_id")
  userId      String      @map("user_id")  // ADD: Who added the note
  title       String
  fileUrl     String      @map("file_url")
  fileName    String      @map("file_name")
  fileSize    Int?        @map("file_size")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  video       Video       @relation(fields: [videoId], references: [id], onDelete: Cascade)
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([videoId])
  @@index([userId])
  @@map("video_notes")
}
```

## 7. Backend Authorization Implementation

### Video Routes Authorization
```javascript
// BE/src/routes/videos.js

// GET /videos - Anyone can read (filtered by permissions)
router.get('/', authenticate, async (req, res) => {
  const { userId, role } = req.user;
  const { courseId, date } = req.query;
  
  const where = {};
  if (role === 'student') {
    // Students can only see videos in courses they have access to
    where.course = {
      // Add enrollment check if you have enrollment model
    };
  } else if (role === 'tutor') {
    // Tutors can see videos in courses they own
    where.course = {
      userId: userId
    };
  }
  
  // ... rest of query
});

// POST /videos - Only tutors can create
router.post('/', authenticate, authorize('tutor'), async (req, res) => {
  // Only tutors can create videos
});

// PATCH /videos/:id - Only creator can update
router.patch('/:id', authenticate, async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  
  if (req.user.role === 'student' && video.userId !== req.user.id) {
    return res.status(403).json({ error: 'You can only update your own videos' });
  }
  
  if (req.user.role === 'tutor') {
    // Check if video belongs to a course they own
    const course = await prisma.course.findUnique({ where: { id: video.courseId } });
    if (course.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update videos in your courses' });
    }
  }
  
  // ... update logic
});

// PATCH /videos/:id/watched - Anyone can mark as watched
router.patch('/:id/watched', authenticate, async (req, res) => {
  // Students can mark any video as watched
  // ... update watched status
});
```

### Assignment Routes Authorization
```javascript
// BE/src/routes/assignments.js

// POST /assignments - Only tutors can create
router.post('/', authenticate, authorize('tutor'), async (req, res) => {
  // Verify course ownership
  const course = await prisma.course.findUnique({ where: { id: req.body.courseId } });
  if (course.userId !== req.user.id) {
    return res.status(403).json({ error: 'You can only create assignments in your courses' });
  }
  // ... create assignment
});

// PATCH /assignments/:id - Only creator can update
router.patch('/:id', authenticate, async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  
  if (assignment.userId !== req.user.id) {
    return res.status(403).json({ error: 'You can only update your own assignments' });
  }
  
  // Students can only update status
  if (req.user.role === 'student') {
    const allowedFields = ['status'];
    // Filter updates to only allowed fields
  }
  
  // ... update logic
});
```

## 8. Frontend Permission Checks

### Video Components
```javascript
// FE/src/components/videos/VideoCard.jsx
const VideoCard = ({ video }) => {
  const { userRole, userId } = useApp();
  const canEdit = userRole === 'tutor' || (userRole === 'student' && video.userId === userId);
  const canDelete = canEdit;
  
  // Show edit/delete buttons only if user has permission
};
```

### Assignment Components
```javascript
// FE/src/components/AssignmentCard.jsx
const AssignmentCard = ({ assignment }) => {
  const { userRole, userId } = useApp();
  const canEdit = userRole === 'tutor' && assignment.userId === userId;
  const canSubmit = userRole === 'student';
  
  // Show appropriate actions based on role
};
```

## 9. Recommended Implementation Flow

### For Videos:
1. **Teachers create videos** for courses they own
2. **Students view videos** and mark them as watched
3. **Teachers attach notes** to videos (or students can add their own notes if needed)

### For Assignments:
1. **Teachers create assignments** for courses they own
2. **Students view assignments** assigned to them
3. **Students create submissions** (submit work)
4. **Teachers review submissions** and provide feedback/scores
5. **Students update their submissions** (if allowed before deadline)

## 10. Decision Required

Please clarify:

1. **Can students create videos?**
   - Option A: No, only teachers create videos (students only view)
   - Option B: Yes, students can create their own videos for self-study

2. **Can students create assignments?**
   - Option A: No, only teachers create assignments (students only submit)
   - Option B: Yes, students can create assignments for themselves

3. **Can students add notes to videos?**
   - Option A: No, only teachers add notes (notes are course materials)
   - Option B: Yes, students can add their own notes (personal notes)

Based on your answers, I'll update the schema and implement the appropriate permissions.
