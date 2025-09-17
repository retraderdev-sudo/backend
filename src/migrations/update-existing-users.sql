-- Update existing users to have usernames
-- This script should be run before starting the application

-- First, update users with NULL or empty usernames
UPDATE users 
SET username = CONCAT('user_', id) 
WHERE username IS NULL OR username = '';

-- Now make username NOT NULL and UNIQUE
-- Note: This will be handled by TypeORM when synchronize is true
