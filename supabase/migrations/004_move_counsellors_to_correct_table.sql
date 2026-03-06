-- Move existing counsellor profiles from expert_astrologers to expert_counsellors table
-- This migration cleans up incorrectly saved counsellor profiles

-- First, let's see what counsellor profiles exist in expert_astrologers
-- These are profiles where the user has specialization = 'counsellor' in the profiles table

-- Create a temporary function to move counsellor profiles
DO $$
DECLARE
    counsellor_record RECORD;
    moved_count INTEGER := 0;
BEGIN
    -- Log the start of migration
    RAISE NOTICE 'Starting migration: Moving counsellor profiles from expert_astrologers to expert_counsellors';
    
    -- Loop through all counsellor profiles in expert_astrologers
    FOR counsellor_record IN 
        SELECT ea.*, p.specialization, p.full_name
        FROM expert_astrologers ea
        INNER JOIN profiles p ON ea.id = p.id
        WHERE p.specialization = 'counsellor'
        AND ea.id NOT IN (SELECT id FROM expert_counsellors WHERE id = ea.id)
    LOOP
        -- Insert into expert_counsellors table
        INSERT INTO expert_counsellors (
            id,
            display_name,
            bio,
            experience_years,
            price_per_minute,
            hourly_rate,
            specialties,
            avatar_url,
            is_profile_complete,
            is_online,
            modes,
            created_at,
            updated_at
        ) VALUES (
            counsellor_record.id,
            counsellor_record.display_name,
            counsellor_record.bio,
            counsellor_record.experience_years,
            counsellor_record.price_per_minute,
            counsellor_record.hourly_rate,
            counsellor_record.specialties,
            counsellor_record.avatar_url,
            counsellor_record.is_profile_complete,
            counsellor_record.is_online,
            COALESCE(counsellor_record.modes, ARRAY['chat', 'video']),
            counsellor_record.created_at,
            counsellor_record.updated_at
        ) ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            bio = EXCLUDED.bio,
            experience_years = EXCLUDED.experience_years,
            price_per_minute = EXCLUDED.price_per_minute,
            hourly_rate = EXCLUDED.hourly_rate,
            specialties = EXCLUDED.specialties,
            avatar_url = EXCLUDED.avatar_url,
            is_profile_complete = EXCLUDED.is_profile_complete,
            is_online = EXCLUDED.is_online,
            modes = COALESCE(EXCLUDED.modes, ARRAY['chat', 'video']),
            updated_at = NOW();
        
        -- Delete from expert_astrologers
        DELETE FROM expert_astrologers WHERE id = counsellor_record.id;
        
        moved_count := moved_count + 1;
        
        RAISE NOTICE 'Moved counsellor profile: % (%)', counsellor_record.full_name, counsellor_record.id;
    END LOOP;
    
    RAISE NOTICE 'Migration completed. Moved % counsellor profiles to expert_counsellors table', moved_count;
    
    -- Verify the migration
    RAISE NOTICE 'Verification:';
    RAISE NOTICE 'Counsellors in expert_counsellors: %', (SELECT COUNT(*) FROM expert_counsellors ec INNER JOIN profiles p ON ec.id = p.id WHERE p.specialization = 'counsellor');
    RAISE NOTICE 'Counsellors remaining in expert_astrologers: %', (SELECT COUNT(*) FROM expert_astrologers ea INNER JOIN profiles p ON ea.id = p.id WHERE p.specialization = 'counsellor');
    
END $$;

-- Create a policy to prevent counsellors from being inserted into expert_astrologers
-- This is a safeguard, though the application logic should prevent this

-- Add a check constraint to expert_astrologers to prevent counsellors
DO $$
BEGIN
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'expert_astrologers_not_counsellor'
    ) THEN
        ALTER TABLE expert_astrologers 
        ADD CONSTRAINT expert_astrologers_not_counsellor 
        CHECK (id NOT IN (
            SELECT id FROM profiles WHERE specialization = 'counsellor'
        ));
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add check constraint (may not be supported with cross-table reference)';
END $$;

-- Create a trigger to prevent counsellor inserts into expert_astrologers
CREATE OR REPLACE FUNCTION prevent_counsellor_in_astrologers()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is a counsellor
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.id AND specialization = 'counsellor'
    ) THEN
        RAISE EXCEPTION 'Counsellors cannot be inserted into expert_astrologers table. Use expert_counsellors table instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS prevent_counsellor_trigger ON expert_astrologers;

-- Create the trigger
CREATE TRIGGER prevent_counsellor_trigger
    BEFORE INSERT OR UPDATE ON expert_astrologers
    FOR EACH ROW
    EXECUTE FUNCTION prevent_counsellor_in_astrologers();

-- Verify trigger creation
SELECT 'Trigger created successfully' as status;
