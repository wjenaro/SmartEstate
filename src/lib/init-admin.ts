import { createAdminUser } from './create-admin';

// Admin credentials
const ADMIN_EMAIL = 'admin@rentease.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_FIRST_NAME = 'System';
const ADMIN_LAST_NAME = 'Administrator';
const ADMIN_ROLE = 'super_admin' as const;

// Function to initialize the admin user
export async function initializeAdmin() {
  console.log('Initializing admin user...');
  
  const result = await createAdminUser(
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_ROLE
  );
  
  if (result.success) {
    console.log('✅ Admin user created successfully:', result.user);
    return { success: true, message: 'Admin user created', user: result.user };
  } else {
    // Check if the error is because the user already exists
    if (result.error && (result.error.message.includes('already registered') || result.error.message.includes('already exists'))) {
      console.log('⚠️ Admin user already exists');
      return { success: true, message: 'Admin user already exists' };
    }
    
    console.error('❌ Failed to create admin user:', result.error);
    return { success: false, message: 'Failed to create admin user', error: result.error };
  }
}

// Execute the initialization if this file is run directly
if (typeof window !== 'undefined') {
  // In browser environment
  console.log('Admin initialization script loaded');
  
  // Add a global function to execute this from the console
  (window as any).initializeAdminUser = async () => {
    const result = await initializeAdmin();
    return result;
  };
  
  console.log('To create an admin user, run: await initializeAdminUser()');
}
