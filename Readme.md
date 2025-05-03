# INSYD Backend

## Tech Stack

- Express
- Node.js
- MongoDB
- AWS SQS Service

## Deployment

- Deployed on AWS EC2 instance
- Link --> https://insydai.rahulgupta.tech/api/v1/*

## API Endpoints

### Authentication (done)

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Users (done)

- `GET /api/users/me` - Get current user's profile
- `GET /api/users` - Get all users (with optional search)
- `GET /api/users/profile/:id` - Get user by ID
- `GET /api/users/queue` - Get user queue for connections
- `GET /api/users/likes/sent` - Get users the current user has liked
- `GET /api/users/likes/received` - Get users who liked the current user
- `POST /api/users/broadcast` - Send a broadcast message
- `GET /api/users/broadcast` - Get broadcast messages
- `PATCH /api/users/me` - Update user profile

### Connections (done)

- `GET /api/connections/sent` - Get sent connection requests
- `GET /api/connections/received` - Get received connection requests
- `POST /api/connections/request` - Send a connection request
- `POST /api/connections/skip` - Skip a user
- `POST /api/connections/respond` - Respond to a connection request

### Likes (done)

- `POST /api/likes` - Like a user
- `DELETE /api/likes` - Unlike a user

### Notifications (done)

- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `POST /api/notifications/mark-read` - Mark notifications as read
