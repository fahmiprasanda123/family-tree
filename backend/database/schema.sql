--
-- Schema Silsilah Keluarga & Default Seed
--

CREATE TABLE IF NOT EXISTS public.family_members (
    id uuid PRIMARY KEY,
    full_name text NOT NULL,
    nickname text,
    gender text NOT NULL,
    birth_date timestamp with time zone,
    birth_place text,
    death_date timestamp with time zone,
    photo_url text,
    bio text,
    phone text,
    address text,
    occupation text,
    is_alive boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_family_members_deleted_at ON public.family_members USING btree (deleted_at);

CREATE TABLE IF NOT EXISTS public.relationships (
    id uuid PRIMARY KEY,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    relationship_type text DEFAULT 'biological'::text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT fk_family_members_children FOREIGN KEY (parent_id) REFERENCES public.family_members(id),
    CONSTRAINT fk_family_members_parents FOREIGN KEY (child_id) REFERENCES public.family_members(id)
);

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'member'::text,
    family_member_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    CONSTRAINT fk_users_family_member FOREIGN KEY (family_member_id) REFERENCES public.family_members(id)
);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users USING btree (deleted_at);

-- Default Admin User (Password: admin123)
INSERT INTO public.users (id, name, email, password, role, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Administrator',
    'admin@admin.com',
    '$2a$10$ly4vWMszl6SK/sOMZPVmn.YIlxma2PybwF1LjR3R/ueCkJMpkjNjC',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
