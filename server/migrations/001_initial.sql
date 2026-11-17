-- Skema awal PadiSehat. Jalankan melalui: cd server && npm run migrate
-- Tidak membuat akun owner bawaan dan tidak menyimpan kredensial contoh.

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name varchar(80) NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 80),
  email varchar(254) NOT NULL CHECK (email = lower(email)),
  password_hash text NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'store_owner', 'admin')),
  status varchar(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name varchar(60) NOT NULL CHECK (char_length(btrim(name)) BETWEEN 3 AND 60),
  category varchar(30) NOT NULL CHECK (char_length(btrim(category)) BETWEEN 2 AND 30),
  price integer NOT NULL CHECK (price >= 0),
  stock integer NOT NULL CHECK (stock BETWEEN 0 AND 1000000),
  description varchar(300) NOT NULL
    CHECK (char_length(btrim(description)) BETWEEN 10 AND 300),
  image_path text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_public_catalog_idx
  ON products (is_active, category, is_featured DESC, name);

CREATE INDEX products_owner_idx
  ON products (owner_id, is_active, updated_at DESC);

CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(80) NOT NULL,
  entity_type varchar(40),
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent varchar(512),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_actor_created_idx
  ON audit_logs (actor_user_id, created_at DESC);

CREATE INDEX audit_logs_entity_idx
  ON audit_logs (entity_type, entity_id, created_at DESC);

CREATE TABLE user_sessions (
  sid varchar NOT NULL PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX user_sessions_expire_idx ON user_sessions (expire);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

CREATE POLICY products_public_read
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY products_owner_manage
  ON products FOR ALL
  USING (
    owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND current_setting('app.user_role', true) IN ('store_owner', 'admin')
  )
  WITH CHECK (
    owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND current_setting('app.user_role', true) IN ('store_owner', 'admin')
  );

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_server_insert
  ON audit_logs FOR INSERT
  WITH CHECK (
    actor_user_id IS NULL
    OR actor_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  );

CREATE POLICY audit_logs_admin_read
  ON audit_logs FOR SELECT
  USING (current_setting('app.user_role', true) = 'admin');
