# Digital Twin Platform

A comprehensive digital twin platform with advanced features for object manipulation, authentication, and user management.

## Features

### Week 2: Object Duplication Feature
- **Shortcut**: Shift + D
- **Functionality**: 
  - Duplicates selected object
  - Attaches to cursor for precise placement
  - Places object on left-click
- **Use Case**: Quick object replication and positioning in the digital twin environment

### Week 3: Google OAuth Integration (Frontend)
- **Implementation**: Frontend authentication using Google OAuth
- **Components**:
  - Google Sign-In button
  - OAuth flow handling
  - User session management
- **Security**: Secure token handling and state management

### Week 4: Backend Authentication System
- **Technology Stack**:
  - Node.js with Express.js
  - Supabase for database management
- **Features**:
  - User registration
  - Login system
  - Database integration
- **Database Structure**:
  - Table: `profiles`
    - User information storage
    - Authentication data management
```sql
    create table profiles (
     id uuid references auth.users on delete cascade,
     name text,
     email text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     primary key (id)
    );

    alter table profiles enable row level security;

    create policy "Users can view their own profile"
    on profiles for select
    using ( auth.uid() = id );


   -- Create a policy that allows users to update their own profile
    create policy "Users can update their own profile"
    on profiles for update
    using ( auth.uid() = id );


   -- Function to handle new user creation
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
     insert into public.profiles (id, name, email)
     values (new.id, new.raw_user_meta_data->>'name', new.email);
     return new;
    end;
    $$ language plpgsql security definer;

      -- Trigger to call the function when a new user is created
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
```

### Week 5: OAuth Backend Integration
- **Authentication Flow**:
  1. **Existing Users**:
     - Direct login via Google OAuth
     - Automatic validation of user information
  2. **New Users**:
     - Redirect to signup page
     - Automatic registration with Google credentials
     - Immediate login after registration
- **Error Handling**:
  - User not registered notifications
  - Registration prompts
  - Authentication error management

### Week 6: Security Implementation
- **Protected Routes**:
  - JWT token-based authentication
  - Route protection middleware
  - Token validation
- **Session Management**:
  - Secure logout functionality
  - Token invalidation
  - Session cleanup

### Week 7: Password Management System
- **Features**:
  1. **Forgot Password**:
     - Email-based password reset
     - Secure token generation
     - Time-limited reset links
  2. **Reset Password**:
     - Secure password update
     - Supabase database synchronization
     - Password validation

```sql
-- changes made to table to accomodate forgot password 
alter table profiles add column reset_token text;
alter table profiles add column reset_token_expiry timestamptz;
```
- **Security Measures**:
  - Encrypted communication
  - Secure token handling
  - Password strength requirements

## Technical Requirements

### Backend
- Node.js
- Express.js
- Supabase
- JWT for authentication
- Email service integration

### Frontend
- React.js
- Google OAuth integration
- State management
- Secure token handling

### Database
- Supabase
- Profiles table structure
- Authentication tables

## Environment Setup
For detailed environment setup instructions, please refer to [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

## Security Considerations
- JWT token management
- OAuth security
- Password encryption
- Secure session handling
- Protected route implementation
