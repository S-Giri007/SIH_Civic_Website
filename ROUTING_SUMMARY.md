# Civic Portal - Complete Routing Setup

## Frontend Routes

### Public Routes (No Authentication Required)
- **`/`** - Landing page with project information and features
- **`/report`** - Public issue reporting form
- **`/login`** - Officer login page

### Protected Routes (Authentication Required)
- **`/dashboard`** - Officer dashboard (officers only)

### Error Routes
- **`*`** - 404 Not Found page for any unmatched routes

## Route Features

### Navigation
- **Navigation Component**: Shows for authenticated users only
- **Active Route Highlighting**: Current page is highlighted in navigation
- **Role-based Navigation**: Different menu items based on user role

### Route Protection
- **ProtectedRoute Component**: Redirects unauthenticated users to login
- **Role Verification**: Ensures only officers can access dashboard
- **Auto-redirect**: Authenticated users are redirected from login to dashboard

### User Experience
- **Loading State**: Shows spinner while checking authentication
- **Breadcrumb Navigation**: Clear navigation paths
- **Back Navigation**: 404 page includes back button functionality

## Backend API Routes

### Authentication Routes
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login with JWT
- **POST** `/api/auth/simple-login` - Simple login without JWT
- **GET** `/api/auth/me` - Get current user info
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/verify-officer/:officerId` - Verify officer account
- **GET** `/api/auth/unverified-officers` - Get unverified officers

### User Management Routes
- **GET** `/api/users` - Get all users with pagination and filters
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user profile
- **DELETE** `/api/users/:id` - Deactivate user

### Issue Management Routes
- **POST** `/api/issues` - Create new issue (public or authenticated)
- **GET** `/api/issues` - Get all issues with filtering and pagination
- **GET** `/api/issues/:id` - Get issue by ID
- **PUT** `/api/issues/:id` - Update issue
- **PATCH** `/api/issues/:id/assign` - Assign issue to officer
- **GET** `/api/issues/stats/overview` - Get issue statistics
- **DELETE** `/api/issues/:id` - Delete issue

## Route Security

### Frontend Security
- Protected routes check authentication status
- Role-based access control for officer features
- Automatic token validation on app load

### Backend Security
- JWT token authentication for protected routes
- Role-based middleware for officer-only endpoints
- Input validation and sanitization
- Rate limiting and security headers

## Navigation Flow

### Public User Flow
1. **Landing Page (`/`)** → Learn about the project and navigate to report or login
2. **Report (`/report`)** → Submit civic complaint with photos and location
3. **Officer Login (`/login`)** → Access officer portal

### Officer Flow
1. **Login (`/login`)** → Authenticate as officer
2. **Dashboard (`/dashboard`)** → Manage issues and view statistics
3. **Navigation** → Switch between different views

### Error Handling
1. **Invalid URL** → 404 Not Found page
2. **Unauthorized Access** → Redirect to login
3. **Network Errors** → User-friendly error messages

## Implementation Details

### React Router Setup
- Uses `BrowserRouter` for clean URLs
- `Routes` and `Route` components for route definition
- `Navigate` component for programmatic redirects
- `Link` components for navigation

### Authentication Integration
- Persistent authentication state across page refreshes
- Token storage in localStorage
- Automatic logout on token expiration
- Role-based route access

### Performance Optimizations
- Lazy loading for large components (can be added)
- Route-based code splitting (can be implemented)
- Efficient re-renders with proper state management