# CollabOS Meetings API

ASP.NET Core API for issuing LiveKit Cloud meeting tokens.

Required backend environment variables:

```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
AUTH_AUTHORITY=https://securetoken.google.com/your-firebase-project-id
AUTH_AUDIENCE=your-firebase-project-id
COLLABOS_FRONTEND_ORIGINS=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

Do not put `LIVEKIT_API_SECRET` in the React app or commit it to source control.

Endpoints:

- `POST /api/meetings/create`
- `POST /api/meetings/schedule`
- `POST /api/meetings/join`
- `GET /api/meetings/{roomId}`
- `DELETE /api/meetings/{roomId}`

All endpoints require `Authorization: Bearer <authenticated-user-jwt>`.
