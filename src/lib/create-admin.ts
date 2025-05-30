import { supabase } from '@/integrations/supabase/client';

// This function creates an admin user with the specified credentials
export async function createAdminUser(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
  role: 'super_admin' | 'admin' | 'support' = 'admin'
) {
  try {
    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          is_admin: true
        }
      }
    });

    if (authError) {
      console.error('Error creating admin auth user:', authError);
      return { success: false, error: authError };
    }

    if (!authData.user) {
      return { success: false, error: { message: 'Failed to create user' } };
    }

    console.log('Created auth user:', authData.user.id);
    
    // Step 2: Create the admin_users record
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        auth_user_id: authData.user.id,
        email: email,
        role: role,
        permissions: getPermissionsForRole(role),
        is_active: true
      })
      .select()
      .single();

    if (adminError) {
      console.error('Error creating admin user record:', adminError);
      return { success: false, error: adminError };
    }

    return { 
      success: true, 
      user: {
        ...adminData,
        auth_id: authData.user.id
      }
    };
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return { success: false, error };
  }
}

// Helper function to get permissions based on role
function getPermissionsForRole(role: string): string[] {
  switch(role) {
    case 'super_admin':
      return [
        'manage_users', 
        'manage_admins', 
        'view_analytics', 
        'manage_subscriptions',
        'manage_platform',
        'system_settings'
      ];
    case 'admin':
      return [
        'manage_users', 
        'view_analytics', 
        'manage_subscriptions'
      ];
    case 'support':
      return [
        'view_users', 
        'view_analytics'
      ];
    default:
      return [];
  }
}
