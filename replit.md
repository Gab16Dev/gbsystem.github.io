# Discord Embed Manager

## Overview

The Discord Embed Manager is a full-stack web application that allows users to create, manage, and send Discord embeds. The application features a React frontend with a comprehensive UI built using shadcn/ui components, a Node.js/Express backend, and PostgreSQL database integration using Drizzle ORM. The system includes user authentication, embed creation tools, logging capabilities, and a Discord-themed design.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing with public/protected routes
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Discord-themed color variables
- **Form Handling**: React Hook Form for form management
- **Public Pages**: Landing page with purchase flow, separate login page

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful API with `/api` prefix routing
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: User management with username/password authentication
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- Simple username/password authentication
- In-memory user storage with predefined admin/user roles
- Session-based authentication for API protection

### Embed Creation Interface
- Rich form interface for Discord embed creation
- Real-time embed preview functionality
- Support for all Discord embed properties (title, description, color, images, fields, etc.)
- Dynamic field management for custom embed fields

### Storage Systems
- **Server Storage**: In-memory storage for user management
- **Client Storage**: LocalStorage for form persistence and logging
- **Session Storage**: PostgreSQL-backed session management

### UI Components
- Comprehensive set of accessible UI components from shadcn/ui
- Discord-themed color scheme with dark/light mode support
- Responsive design with mobile-first approach
- Toast notifications for user feedback

### Logging System
- Token usage logging for audit trails
- Message sending logs with status tracking
- Purchase logs for payment tracking
- Client-side storage for log persistence

### Payment Integration (Mercado Pago)
- Real payment link generation using public API
- Automatic user creation upon payment approval
- Purchase logging with complete transaction details
- Payment status verification system
- Secure credential generation and display

### User Management System
- Dynamic user storage with localStorage persistence
- Admin panel for manual user creation
- Role-based access control (admin/user)
- Password generation utilities
- Real-time user list management

### Page Architecture
- **Public Landing Page** (`/`): Marketing page with purchase flow for new users
- **Protected Login Page** (`/login`): Authentication interface for existing users
- **Access Control**: Only users with approved purchases or default admin accounts can login
- **Redirect System**: Login button on landing page redirects to protected login interface

### Security & Privacy Features
- **Data Isolation**: Each user sees only their own logs and configurations
- **Sensitive Field Protection**: Bot tokens and channel IDs are automatically cleared after embed sending
- **User-Specific Storage**: All user data is stored with unique keys to prevent cross-user access
- **Admin Privileges**: Administrators can view aggregated logs from all users for monitoring
- **No Persistent Sensitive Data**: Tokens and IDs are never saved to localStorage for security

## Data Flow

### Embed Creation Flow
1. User authenticates via login form
2. User fills out embed creation form with auto-save to localStorage
3. Form data is validated client-side
4. Embed preview updates in real-time
5. User submits to Discord API (client-side integration)
6. Success/failure logged to localStorage

### Authentication Flow
1. User provides credentials
2. Server validates against predefined user store
3. Session created and stored in PostgreSQL
4. Client receives authentication status
5. Protected routes become accessible

### Data Persistence
- Form data persists across sessions via localStorage
- User sessions persist across browser restarts
- Logs maintain history of user actions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit development integration

### Discord Integration
- Client-side Discord API integration for sending embeds
- Bot token management for Discord operations
- Channel ID validation and targeting

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Replit-specific development tooling
- Runtime error overlay for debugging
- TypeScript checking in watch mode

### Production Build
- Vite build process for optimized client bundle
- esbuild compilation for server code
- Static asset optimization and bundling
- Environment-specific configuration

### Database Strategy
- Drizzle migrations for schema management
- Environment variable configuration for database URL
- Serverless PostgreSQL with Neon for scalability

### Environment Configuration
- `NODE_ENV` based environment detection
- Database URL configuration via environment variables
- Development vs production build differentiation

## Changelog

```
Changelog:
- July 05, 2025. Initial setup with Discord embed management system
- July 05, 2025. Added Mercado Pago payment integration with automatic user creation
- July 05, 2025. Enhanced admin panel with purchase logs and user management
- July 05, 2025. Added dynamic user storage with localStorage persistence
- July 05, 2025. Created public landing page with purchase flow and protected login access
- July 05, 2025. Implemented access control - only users with approved purchases can login
- July 05, 2025. Added automatic clearing of sensitive fields after embed sending
- July 05, 2025. Implemented user-specific data isolation for security and privacy
- July 05, 2025. Enhanced admin privileges to view all logs while users see only their own
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```