# ED-Tech Backend API Documentation

## Base URL
`http://localhost:5000/api/v1`

## Default Admin Credentials

After setting up the application, run the following command to create a default admin user:

```bash
npm run seed:admin
```

The default admin credentials will be:
- **Email**: admin@edtech.com
- **Password**: AdminPass123!

**Important**: Change the default password after first login for security.

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Roles
- `student`: Default user role
- `admin`: Administrative access

---

## Authentication Routes

### Register User
**POST** `/api/v1/auth/register`

Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "student"
}
```

### Login User
**POST** `/api/v1/auth/login`

Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout User
**GET** `/api/v1/auth/logout`

Requires authentication.

### Get Current User
**GET** `/api/v1/auth/me`

Requires authentication.

### Update User Details
**PUT** `/api/v1/auth/updatedetails`

Requires authentication.

Request Body:
```json
{
  "fullName": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1987654321"
}
```

### Update Password
**PUT** `/api/v1/auth/updatepassword`

Requires authentication.

Request Body:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Forgot Password
**POST** `/api/v1/auth/forgotpassword`

Request Body:
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**PUT** `/api/v1/auth/resetpassword/:resettoken`

Request Body:
```json
{
  "password": "newpassword123"
}
```

---

## User Routes

### Get User Profile
**GET** `/api/v1/users/profile`

Requires authentication.

### Update User Profile
**PUT** `/api/v1/users/profile`

Requires authentication.

### Get All Users (Admin Only)
**GET** `/api/v1/users`

Requires authentication and admin role.

### Get Single User (Admin Only)
**GET** `/api/v1/users/:id`

Requires authentication and admin role.

---

## Course Routes

### Get All Courses
**GET** `/api/v1/courses`

Query Parameters:
- `search`: Search term
- `category`: Filter by category
- `experienceLevel`: Filter by experience level
- `sort`: Sort by field (e.g., "title", "-rating")
- `select`: Select specific fields (e.g., "title,instructor")
- `page`: Page number
- `limit`: Items per page

### Get Single Course
**GET** `/api/v1/courses/:id`

### Create Course (Admin Only)
**POST** `/api/v1/courses`

Requires authentication and admin role.

Request Body:
```json
{
  "title": "JavaScript Fundamentals",
  "category": "Programming",
  "experienceLevel": "Beginner",
  "shortDescription": "Learn JavaScript basics",
  "longDescription": "Comprehensive JavaScript course...",
  "courseCurriculum": [
    {
      "module": "Introduction",
      "lessons": [
        {
          "lessonTitle": "Welcome",
          "lessonContent": "Course introduction",
          "duration": "10 mins"
        }
      ]
    }
  ],
  "price": 49.99,
  "thumbnail": "https://example.com/image.jpg",
  "instructor": "Jane Doe"
}
```

### Update Course (Admin Only)
**PUT** `/api/v1/courses/:id`

Requires authentication and admin role.

### Delete Course (Admin Only)
**DELETE** `/api/v1/courses/:id`

Requires authentication and admin role.

### Upload Course Thumbnail (Admin Only)
**PUT** `/api/v1/courses/:id/upload-thumbnail`

Requires authentication and admin role.
File upload with field name "thumbnail".

### Get Top Rated Courses
**GET** `/api/v1/courses/top`

### Get Most Popular Courses
**GET** `/api/v1/courses/popular`

---

## Enrollment Routes

### Enroll in Course
**POST** `/api/v1/enrollments`

Requires authentication.

Request Body:
```json
{
  "courseId": "course-id-here"
}
```

### Get My Enrollments
**GET** `/api/v1/enrollments/my-enrollments`

Requires authentication.

### Get All Enrollments (Admin Only)
**GET** `/api/v1/enrollments`

Requires authentication and admin role.

### Get Single Enrollment (Admin Only)
**GET** `/api/v1/enrollments/:id`

Requires authentication and admin role.

### Update Enrollment Progress
**PUT** `/api/v1/enrollments/:id/progress`

Requires authentication.

Request Body:
```json
{
  "moduleId": "module-id-here",
  "lessonId": "lesson-id-here"
}
```

---

## Cart Routes

### Get User Cart
**GET** `/api/v1/cart`

Requires authentication.

### Add to Cart
**POST** `/api/v1/cart`

Requires authentication.

Request Body:
```json
{
  "courseId": "course-id-here",
  "quantity": 1
}
```

### Update Cart Item
**PUT** `/api/v1/cart/:itemId`

Requires authentication.

Request Body:
```json
{
  "quantity": 2
}
```

### Remove from Cart
**DELETE** `/api/v1/cart/:itemId`

Requires authentication.

### Clear Cart
**DELETE** `/api/v1/cart`

Requires authentication.

### Get Cart Total
**GET** `/api/v1/cart/total`

Requires authentication.

### Checkout
**POST** `/api/v1/cart/checkout`

Requires authentication.

---

## Events Routes

### Get All Events
**GET** `/api/v1/events`

### Get Single Event
**GET** `/api/v1/events/:id`

### Create Event (Admin Only)
**POST** `/api/v1/events`

Requires authentication and admin role.

### Update Event (Admin Only)
**PUT** `/api/v1/events/:id`

Requires authentication and admin role.

### Delete Event (Admin Only)
**DELETE** `/api/v1/events/:id`

Requires authentication and admin role.

### Register for Event
**POST** `/api/v1/events/:id/register`

Requires authentication.

### Get My Events
**GET** `/api/v1/events/my-events`

Requires authentication.

---

## Feedback Routes

### Get All Feedback
**GET** `/api/v1/feedback`

### Get Feedback for Course
**GET** `/api/v1/feedback/course/:courseId`

### Get Single Feedback
**GET** `/api/v1/feedback/:id`

### Submit Feedback
**POST** `/api/v1/feedback`

Requires authentication.

Request Body:
```json
{
  "courseId": "course-id-here",
  "rating": 5,
  "comment": "Great course!"
}
```

### Update Feedback
**PUT** `/api/v1/feedback/:id`

Requires authentication.

### Delete Feedback (Admin Only)
**DELETE** `/api/v1/feedback/:id`

Requires authentication and admin role.

---

## Contact Routes

### Submit Contact Form
**POST** `/api/v1/contacts`

Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "subject": "Support Request",
  "description": "I need help with..."
}
```

### Get All Contacts (Admin Only)
**GET** `/api/v1/contacts`

Requires authentication and admin role.

### Get Single Contact (Admin Only)
**GET** `/api/v1/contacts/:id`

Requires authentication and admin role.

### Update Contact (Admin Only)
**PUT** `/api/v1/contacts/:id`

Requires authentication and admin role.

Request Body:
```json
{
  "isRead": true
}
```

### Delete Contact (Admin Only)
**DELETE** `/api/v1/contacts/:id`

Requires authentication and admin role.

---

## Admin Dashboard Routes

### Get Dashboard Stats
**GET** `/api/v1/admin/dashboard`

Requires authentication and admin role.

### Get All Users (Admin Only)
**GET** `/api/v1/admin/users`

Requires authentication and admin role.

Query Parameters:
- `page`: Page number
- `limit`: Items per page

### Get All Courses (Admin Only)
**GET** `/api/v1/admin/courses`

Requires authentication and admin role.

Query Parameters:
- `page`: Page number
- `limit`: Items per page

### Get All Enrollments (Admin Only)
**GET** `/api/v1/admin/enrollments`

Requires authentication and admin role.

Query Parameters:
- `page`: Page number
- `limit`: Items per page

### Get All Feedback (Admin Only)
**GET** `/api/v1/admin/feedback`

Requires authentication and admin role.

Query Parameters:
- `page`: Page number
- `limit`: Items per page

### Toggle User Active Status (Admin Only)
**PUT** `/api/v1/admin/users/:id/toggle-active`

Requires authentication and admin role.

### Get Enrollment Statistics (Admin Only)
**GET** `/api/v1/admin/stats/enrollment`

Requires authentication and admin role.

---

## HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error