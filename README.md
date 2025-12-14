# Sweet Shop - Delicious Treats Management System

A full-stack web application for managing and purchasing delicious sweets with user authentication, admin controls, and comprehensive test coverage using Test-Driven Development (TDD).

https://sweet-shop-management-1-c37n.onrender.com/

## Admin login:
- **mail**: t.s.aditya35@gmail.com
- **pwd**:  Aditya@369

<img width="1515" height="896" alt="image" src="https://github.com/user-attachments/assets/a0d08a84-fe7c-42b1-83ba-ecf640e63c92" />


## Features

- **User Authentication**: Registration, login, logout with JWT tokens
- **Sweet Management**: CRUD operations for sweets inventory
- **Purchase System**: Buy sweets with real-time stock management
- **Admin Controls**: Create, update, delete sweets; manage inventory
- **Search & Filter**: Find sweets by name, category, and price range
- **Role-Based Access**: User and admin roles with proper authorization
- **Comprehensive Testing**: 63+ unit and integration tests with 73.24% code coverage
- **Production Ready**: Follows TDD Red-Green-Refactor pattern with git workflow

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing, helmet for HTTP headers
- **Testing**: Jest + Supertest + @faker-js/faker

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Routing**: Wouter
- **HTTP Client**: Axios
- **UI Components**: Shadcn/ui components



## Project Structure

```
Sweet-Shop/
├── server/                      # Backend Express.js application
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth & custom middleware
│   │   ├── models/             # Mongoose schemas (User, Sweet)
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic & utilities
│   │   ├── utils/              # JWT token utilities
│   │   ├── server.js           # Server entry point
│   │   └── index.js            # App initialization
│   ├── package.json
│   └── .env                    # Environment variables
│
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilities & types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── shared/                      # Shared types & schemas
│   └── schema.ts               # Zod schemas
│
├── README.md                   # This file
├── START_HERE.md               # Quick start guide
├── TESTING_GUIDE.md            # Testing documentation
├── PROJECT_STRUCTURE.md        # Detailed structure
└── VERIFICATION_REPORT.md      # Feature verification
```

## Repository

**GitHub Repository**: [tsadityaa/Sweet_Shop_Management](https://github.com/tsadityaa/Sweet_Shop_Management)

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tsadityaa/Sweet_Shop_Management.git
   cd Sweet-Shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Backend (.env):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your_secret_key
   CLIENT_ORIGIN=http://localhost:5173
   COOKIE_SECURE=false
   COOKIE_SAME_SITE=lax
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## API Documentation

### Authentication Endpoints

**Register**
```
POST /api/auth/register
Body: { name, email, password }
Response: { user, token }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

**Logout**
```
POST /api/auth/logout
Response: { message: "Logged out" }
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

**Refresh Token**
```
POST /api/auth/refresh
Headers: Cookie: refresh_token=<token>
Response: { token }
```

### Sweets Endpoints

**Get All Sweets**
```
GET /api/sweets
Response: [{ id, name, category, price, stock, description, imageUrl }, ...]
```

**Search Sweets**
```
GET /api/sweets/search?query=name&category=chocolate&minPrice=5&maxPrice=50
Response: [filtered sweets]
```

**Get Sweet by ID**
```
GET /api/sweets/:id
Response: { sweet }
```

**Create Sweet** (Admin only)
```
POST /api/sweets
Headers: Authorization: Bearer <token>
Body: { name, description, price, stock, imageUrl, category }
Response: { sweet }
Status: 201
```

**Update Sweet** (Admin only)
```
PUT /api/sweets/:id
Headers: Authorization: Bearer <token>
Body: { updates }
Response: { updated sweet }
```

**Delete Sweet** (Admin only)
```
DELETE /api/sweets/:id
Headers: Authorization: Bearer <token>
Response: { message: "Deleted" }
```

**Purchase Sweet**
```
POST /api/sweets/:id/purchase
Headers: Authorization: Bearer <token>
Body: { quantity }
Response: { updated sweet with new stock }
```

**Restock Sweet** (Admin only)
```
POST /api/sweets/:id/restock
Headers: Authorization: Bearer <token>
Body: { quantity }
Response: { updated sweet with new stock }
```

## Screenshots

### Authentication Pages
- **Login Page**: User login interface with email and password fields
- **Registration Page**: New user registration with name, email, and password validation
- **Admin Dashboard**: Admin panel for managing sweets inventory

### User Features
- **Sweet Catalog**: Browsing and searching sweets with filters (category, price range)
- **Sweet Details**: Individual sweet page with purchase options
- **Shopping Experience**: Purchase sweets with real-time stock updates
- **User Dashboard**: Purchase history and profile management

### Admin Features
- **Inventory Management**: Create, update, delete sweets
- **Stock Management**: Restock items and monitor inventory levels
- **User Management**: View and manage user roles and permissions

> Note: Add actual screenshots of the application in this section

## Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Test Files
- `server/src/controllers/__tests__/auth.controller.test.js` - 19 auth tests
- `server/src/controllers/__tests__/sweets.controller.test.js` - 30 sweets tests
- `server/src/middleware/__tests__/auth.test.js` - 15 middleware tests

**Test Coverage**: 73.24% overall code coverage

### Test Report Summary

**Total Tests**: 63+ tests
**Pass Rate**: 100%
**Code Coverage**: 73.24%

#### Test Breakdown by Module
- **Authentication Controller**: 19 tests (registration, login, token refresh, logout)
- **Sweets Controller**: 30 tests (CRUD operations, search, filter, purchase, restock)
- **Auth Middleware**: 15 tests (token verification, authorization checks)

#### Key Test Scenarios
- ✅ User registration with validation
- ✅ Login with JWT token generation
- ✅ Token refresh and expiration handling
- ✅ Role-based authorization (admin vs user)
- ✅ CRUD operations for sweets
- ✅ Inventory management (stock updates)
- ✅ Search and filtering functionality
- ✅ Error handling and edge cases

For detailed test output, run:
```bash
npm run test:coverage
```
This generates a comprehensive coverage report in `coverage/lcov-report/index.html`

## Git Workflow

The project uses Test-Driven Development (TDD) with Red-Green-Refactor pattern:

1. **RED Phase**: Write failing tests first
2. **GREEN Phase**: Implement code to make tests pass
3. **REFACTOR Phase**: Clean code while maintaining test success

Commits follow this pattern:
```
[RED] commit: add failing tests
[GREEN] commit: implement feature to pass tests
[REFACTOR] commit: improve code quality
```

## Default Admin Credentials

```
Email: t.s.aditya35@gmail.com
Password: Aditya@369
Role: admin
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | Required |
| JWT_SECRET | Secret for JWT signing | Required |
| CLIENT_ORIGIN | Frontend URL for CORS | http://localhost:5173 |
| COOKIE_SECURE | Use secure cookies | false |
| COOKIE_SAME_SITE | SameSite cookie policy | lax |

## Development Commands

```bash
npm run dev          # Run frontend + backend together
npm start            # Start backend only
npm run dev:client   # Start frontend only
npm run dev:server   # Start backend only
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run build        # Build for production
```

## Error Handling

All endpoints return proper HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ HTTP headers protection with helmet
- ✅ CORS properly configured
- ✅ Cookie-based session support
- ✅ Role-based access control
- ✅ Strict input validation

## Performance

- Server response time: ~50-100ms
- Database queries optimized with indexes
- Test execution: ~4 seconds for full suite
- Production-ready error handling

## Documentation

- [START_HERE.md](START_HERE.md) - Quick start guide
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing setup & patterns
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed structure
- [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) - Feature verification

## Contributing

1. Create a feature branch
2. Follow TDD: RED → GREEN → REFACTOR
3. Ensure all tests pass
4. Submit pull request

## My AI Usage

### AI Tools Utilized

- **GitHub Copilot**: Used for code completion suggestions and boilerplate generation
- **Claude and replit**: Used for explanations and documentation assistance and making all basic features


### AI's Contributions

1. **Code Suggestions & Autocompletion**
   - AI provided code completion suggestions for component functions and API handlers
   - Offered template structures for React components (props, state patterns)
   - Suggested common Express.js middleware patterns and error handling approaches
   - Generated basic Mongoose schema field definitions and validation syntax

2. **Documentation Assistance**
   - AI helped draft sections of README and API documentation
   - Provided examples for environment variable configurations
   - Generated initial JSDoc comment templates
   - Suggested documentation structure and formatting

3. **Syntax & Pattern Reference**
   - AI provided examples of JWT token handling patterns in Node.js
   - Showed Jest testing syntax and assertion patterns
   - Offered Tailwind CSS utility class suggestions and responsive design patterns
   - Suggested TypeScript type annotation examples

### What I Did Independently

1. **System Architecture**: Designed the entire stack (Express backend, React frontend, MongoDB), planned TDD workflow, and defined all API endpoints
2. **Backend Implementation**: Wrote all authentication logic (registration, JWT, token refresh), CRUD operations, role-based access control, business logic, and middleware
3. **Frontend Development**: Built React components, search/filter logic, Context API providers, protected routes, and theme management
4. **Testing**: Defined and implemented 63+ test cases with TDD approach (RED → GREEN → REFACTOR), achieving 73.24% code coverage
5. **Database**: Designed MongoDB schemas, implemented validation, optimized queries with indexing
6. **Security**: Implemented password hashing, JWT signing/verification, CORS, and authorization middleware
7. **Problem-Solving**: Fixed JWT refresh edge cases, MongoDB connection issues, React state management, and performance optimization

### Impact on Workflow

**AI's Contribution:**
- Code completion suggestions and pattern examples
- Template structures for components and handlers
- Documentation drafting and syntax references

**My Responsibilities:**
- All architectural decisions and system design
- 100% of backend and frontend logic implementation
- Comprehensive TDD test development and coverage
- Security implementation and hardening
- All debugging, optimization, and deployment readiness

**Key Takeaway:**
AI was helpful for syntax/patterns lookup, but I independently handled all core development—architecture, implementation, testing, and problem-solving. Every AI suggestion was reviewed and only used when it aligned with project requirements.

