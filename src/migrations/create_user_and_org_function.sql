-- Function to create a user and organization together
CREATE OR REPLACE FUNCTION create_user_and_org(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_company_name text,
  p_org_name text,
  p_role text,
  p_is_demo boolean
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This means it will run with the permissions of the creating user
AS $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Create organization first
  INSERT INTO organizations (
    name,
    slug,
    subscription_plan,
    subscription_status,
    is_demo
  ) VALUES (
    p_org_name,
    LOWER(REGEXP_REPLACE(p_org_name, '[^a-zA-Z0-9]+', '-', 'g')),
    'free',
    'active',
    p_is_demo
  )
  RETURNING id INTO v_org_id;

  -- Create user account
  INSERT INTO user_accounts (
    organization_id,
    email,
    first_name,
    last_name,
    phone,
    company_name,
    role,
    is_demo,
    is_owner,
    onboarding_completed
  ) VALUES (
    v_org_id,
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    p_company_name,
    p_role,
    p_is_demo,
    true, -- First user is owner
    false
  )
  RETURNING id INTO v_user_id;

  -- Return both IDs
  v_result := jsonb_build_object(
    'organization_id', v_org_id,
    'user_id', v_user_id
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_and_org TO authenticated;

-- Grant execute permission to anon users (needed for signup)
GRANT EXECUTE ON FUNCTION create_user_and_org TO anon;
