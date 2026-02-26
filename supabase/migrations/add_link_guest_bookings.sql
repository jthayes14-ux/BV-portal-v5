-- Link all unlinked guest bookings to a user by matching email
CREATE OR REPLACE FUNCTION link_guest_bookings(user_uuid UUID, user_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  UPDATE bookings
  SET user_id = user_uuid
  WHERE LOWER(guest_email) = LOWER(user_email)
    AND user_id IS NULL;

  GET DIAGNOSTICS linked_count = ROW_COUNT;
  RETURN linked_count;
END;
$$;

-- Find user_id by email (checks auth.users)
CREATE OR REPLACE FUNCTION find_user_id_by_email(lookup_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user_id UUID;
BEGIN
  SELECT id INTO found_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(lookup_email)
  LIMIT 1;

  RETURN found_user_id;
END;
$$;

-- Grant execute to both authenticated and anonymous roles
GRANT EXECUTE ON FUNCTION link_guest_bookings(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION link_guest_bookings(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION find_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_user_id_by_email(TEXT) TO anon;
