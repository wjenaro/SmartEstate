import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Simple password verification (in a real app, use proper hashing)
// We're using CryptoJS for simple hashing since we don't have access to bcrypt in the browser
function verifyPassword(inputPassword: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  
  // For demonstration only - in a real app, use proper password hashing
  const hashedInput = CryptoJS.SHA256(inputPassword).toString();
  return hashedInput === storedHash;
}

/**
 * Direct admin authentication that bypasses Supabase Auth
 * and checks credentials directly against the admin_users table
 */
export async function directAdminAuth(email: string, password: string) {
  try {
    // Check if this is the default admin password scenario
    const isDefaultAdmin = email === 'admin@kangambili.co.ke' && password === 'Admin@123';
    
    // Get the admin user record
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching admin user:', error);
      return { 
        success: false, 
        error: { message: 'Invalid credentials' } 
      };
    }
    
    if (!adminUser) {
      return { 
        success: false, 
        error: { message: 'Admin user not found' } 
      };
    }
    
    // If using default admin with default password, or if password verification is successful
    // For this demo, we're accepting the default password for the admin account
    if (isDefaultAdmin || verifyPassword(password, adminUser.password_hash)) {
      // Generate a session-like object to mimic Supabase auth
      const sessionId = uuidv4();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Create a mock session
      const session = {
        id: sessionId,
        user: {
          id: adminUser.auth_user_id || uuidv4(),
          email: adminUser.email,
          user_metadata: {
            is_admin: true,
            role: adminUser.role
          }
        },
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString()
      };
      
      // Store in localStorage to persist across page refreshes
      localStorage.setItem('admin_session', JSON.stringify(session));
      
      return {
        success: true,
        data: {
          session,
          user: session.user
        }
      };
    }
    
    return { 
      success: false, 
      error: { message: 'Invalid credentials' }
    };
  } catch (error) {
    console.error('Direct admin auth error:', error);
    return { 
      success: false, 
      error: { message: 'Authentication failed' }
    };
  }
}

/**
 * Get the current admin session from localStorage
 */
export function getAdminSession() {
  try {
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    // Check if session is expired
    if (expiresAt < now) {
      localStorage.removeItem('admin_session');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

/**
 * Clear the admin session
 */
export function clearAdminSession() {
  localStorage.removeItem('admin_session');
}

/**
 * Create/update password hash for admin user
 */
export async function setAdminPassword(email: string, password: string) {
  try {
    // For demonstration only - in a real app, use proper password hashing
    const passwordHash = CryptoJS.SHA256(password).toString();
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('email', email)
      .select()
      .single();
    
    if (error) {
      console.error('Error setting admin password:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error setting admin password:', error);
    return { success: false, error };
  }
}
