
# RentEase Property Management System

## System Overview
RentEase is a comprehensive property management SaaS application designed for landlords and property agents. It streamlines rental property management, tenant tracking, rent collection, invoicing, and communication through an intuitive web interface.

## Tech Stack
- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context and React Query
- **Routing**: React Router
- **Build Tool**: Vite

## Project Structure

### Core Directories
- `/src`: Main source code
  - `/components`: Reusable UI components
    - `/ui`: Shadcn UI components
    - `/layout`: Layout components (Sidebar, Header)
    - `/dashboard`: Dashboard-specific components
    - `/forms`: Form components for data entry
  - `/pages`: Page components representing routes
  - `/lib`: Utility functions and shared logic
  - `/hooks`: Custom React hooks

### Key Components

#### Layout Components
- `MainLayout`: The primary layout wrapper used across all authenticated pages
- `Sidebar`: Navigation sidebar with collapsible functionality
- `Header`: Top navigation bar with user information and actions

#### Page Components
- `Index.tsx`: Dashboard overview with summary statistics
- `Properties.tsx`: Property management interface
- `Units.tsx`: Unit management and tracking
- `Tenants.tsx`: Tenant information and management
- `Financials.tsx`: Financial overview page
- `Invoices.tsx`: Invoice management
- `Payments.tsx`: Payment tracking and reconciliation
- `Expenses.tsx`: Expense tracking and management

#### Form Components
- `PropertyForm.tsx`: Form for adding/editing properties
- `TenantForm.tsx`: Form for adding/editing tenants
- `InvoiceForm.tsx`: Form for creating invoices

## Application Flow

### Authentication Flow (Future Implementation)
1. User arrives at login page
2. After successful authentication, redirect to dashboard
3. JWT token stored for session management
4. Role-based access control determines available features

### Property Management Flow
1. User adds properties via Properties page
2. Properties can have multiple units added
3. Units can be assigned to tenants
4. Financial transactions are linked to properties, units, and tenants

### Financial Flow
1. Invoices are generated for rent and utilities
2. Payments are recorded against invoices
3. Expenses are tracked at property level
4. Financial reports provide insights across properties

## Development Guidelines

### Component Creation
1. Create new components in appropriate directories
2. Prefer small, focused components over large ones
3. Use TypeScript interfaces for props
4. Follow shadcn/ui patterns for consistency

### Styling
1. Use Tailwind CSS classes for styling
2. Follow the established color scheme and UI patterns
3. Ensure responsive design for all components
4. Use shadcn/ui components when possible

### State Management
1. Use React Query for server state
2. Use React Context for UI state where appropriate
3. Keep state as close to where it's used as possible

### Future Implementation
1. Connect to Supabase for authentication and database
2. Implement role-based access control
3. Add real-time notifications
4. Develop payment integrations
5. Implement WhatsApp messaging integration

## Naming Conventions
- React Components: PascalCase
- Files with JSX/TSX: PascalCase
- Utility functions: camelCase
- Custom hooks: use prefix (e.g., useAuth)

## Deployment
1. Use Lovable's built-in deployment
2. Connect custom domain through Lovable settings
3. Set up environment variables for API keys

## Backend Integration (Future)
1. Set up Supabase integration
2. Create database tables following the schema
3. Implement authentication flows
4. Set up row-level security policies
5. Create necessary APIs for data operations

## Testing Strategy
1. Component testing with React Testing Library
2. Integration testing for key flows
3. End-to-end testing for critical paths

## Maintenance Best Practices
1. Regular dependency updates
2. Code refactoring for maintainability
3. Documentation updates with code changes
4. Performance monitoring and optimization
