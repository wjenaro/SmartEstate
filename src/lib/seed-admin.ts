import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Admin user details
const ADMIN_EMAIL = 'admin@rentease.com';
const ADMIN_FIRST_NAME = 'System';
const ADMIN_LAST_NAME = 'Administrator';
const ADMIN_ROLE = 'super_admin';

// This function directly inserts an admin user into the admin_users table
// without requiring authentication first
export async function seedAdminUser() {
  try {
    console.log('Creating admin user directly in database...');
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing admin:', checkError);
      return { success: false, error: checkError };
    }
    
    // If admin already exists, return early
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      return { 
        success: true, 
        message: 'Admin user already exists', 
        user: existingAdmin,
        credentials: {
          email: ADMIN_EMAIL,
          password: 'Use the "Reset Password" feature to set a password'
        }
      };
    }
    
    // Generate a unique ID for the admin user
    const adminId = uuidv4();
    const now = new Date().toISOString();
    
    // Generate a placeholder auth_user_id since it's required by the schema
    const placeholderAuthId = uuidv4();
    
    // Insert admin user directly into the admin_users table
    const { data: adminData, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        auth_user_id: placeholderAuthId, // Required field in the schema
        email: ADMIN_EMAIL,
        role: ADMIN_ROLE,
        permissions: [
          'manage_users', 
          'manage_admins', 
          'view_analytics', 
          'manage_subscriptions',
          'manage_platform',
          'system_settings'
        ],
        is_active: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting admin user:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('Admin user created successfully:', adminData);
    
    return { 
      success: true, 
      message: 'Admin user created directly in database', 
      user: adminData,
      credentials: {
        email: ADMIN_EMAIL,
        instructions: 'Use the "Reset Password" link on the login page to set your password'
      }
    };
  } catch (error) {
    console.error('Error in seedAdminUser:', error);
    return { success: false, error };
  }
}
