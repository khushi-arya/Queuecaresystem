# QueueCare Frontend

A React + TypeScript single-page application (SPA) for hospital queue management system with role-based access control (Patient, Doctor, Admin).

## Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **UI Library:** Material-UI (MUI) v5
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Real-time:** SockJS + StompJS (WebSocket)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v6

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (route pages)
├── layouts/            # Layout wrappers (AppBar, Sidebar)
├── routes/             # Route configuration
├── services/           # API clients & WebSocket
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
├── theme.ts            # MUI theme configuration
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Backend running on http://localhost:8080

### Installation

1. Navigate to the project directory:
   ```bash
   cd queuecare-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your backend URL (if different from defaults):
   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_WS_URL=ws://localhost:8080/ws
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:

```bash
npm run build
```

### Linting & Formatting

Lint the code:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code with Prettier:

```bash
npm run format
```

## Features

### Phase 1: Project Setup ✅
- Vite + React + TypeScript project scaffold
- MUI theme and global styles
- ESLint and Prettier configuration
- Environment variable setup
- Folder structure for all phases

### Phase 2: Authentication & Infrastructure (In Progress)
- JWT-based authentication
- Login/Register pages
- Protected routes
- Auth Context with persistent token storage
- Axios API client with JWT interceptor
- Error handling and 401 redirects

### Phase 3: Shared Components & Layout (Planned)
- Main layout with AppBar and Sidebar
- Notification Center system
- Reusable UI components
- Profile page
- Notification preferences

### Phase 4: Patient Features (Planned)
- Dashboard with upcoming appointments
- Book appointment flow
- View/manage appointments
- Doctor search and filtering
- Real-time queue status
- Appointment notifications

### Phase 5: Doctor Features (Planned)
- Queue management (real-time FIFO)
- Call next patient
- Queue statistics and charts
- Daily token generation
- Profile management

### Phase 6: Admin Features (Planned)
- User promotion (Patient → Doctor)
- Doctor and patient management
- System statistics dashboard

### Phase 7: WebSocket Integration (Planned)
- Real-time queue updates
- Real-time notifications
- Multi-tab synchronization

### Phase 8: Testing & Optimization (Planned)
- End-to-end testing
- Error scenario handling
- Responsive design optimization
- Performance improvements
- Accessibility compliance

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8080/ws` |

## Backend Integration

The frontend communicates with the QueueCare backend at:

- **API Base:** http://localhost:8080
- **WebSocket:** ws://localhost:8080/ws

Make sure the backend is running before starting the frontend development server.

## API Endpoints

The frontend integrates with these backend endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients/{patientId}` - Get patient details
- `GET /api/appointments/patient/{patientId}` - Get patient appointments

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/{doctorId}` - Get doctor details

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/patient/{patientId}` - Get patient appointments
- `PUT /api/appointments/{appointmentId}/status` - Update appointment status

### Queue Management
- `GET /api/queue/today?doctorId={id}` - Get today's queue
- `POST /api/queue/next?doctorId={id}` - Call next patient
- `GET /api/queue/stats?doctorId={id}` - Get queue statistics

### Admin
- `PUT /api/admin/promote/{userId}` - Promote patient to doctor

See backend documentation for complete API reference.

## Troubleshooting

### Port already in use
If port 3000 is already in use, modify `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to different port
}
```

### CORS errors
Ensure the backend has CORS enabled and configured to allow requests from `http://localhost:3000`

### WebSocket connection fails
- Verify backend is running on port 8080
- Check `VITE_WS_URL` in `.env`
- Ensure WebSocket endpoint `/ws` is available

## Contributing

Follow the existing code style and run linting/formatting before submitting:

```bash
npm run format
npm run lint:fix
```

## License

MIT
