-- Initial PostgreSQL schema for SalesManagement.
-- Entity names follow snake_case table naming; ERD USER maps to app_user
-- to avoid conflicts with SQL reserved/user-related identifiers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'sales', 'accountant', 'warehouse');
CREATE TYPE customer_type AS ENUM ('individual', 'company');
CREATE TYPE customer_status AS ENUM ('lead', 'active', 'inactive', 'blocked');
CREATE TYPE address_type AS ENUM ('billing', 'shipping', 'other');
CREATE TYPE opportunity_status AS ENUM ('open', 'won', 'lost');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE sales_order_status AS ENUM ('draft', 'confirmed', 'processing', 'fulfilled', 'cancelled');
CREATE TYPE inventory_movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment', 'reservation');
CREATE TYPE delivery_status AS ENUM ('pending', 'picking', 'shipped', 'delivered', 'failed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE app_user (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(120) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role user_role NOT NULL DEFAULT 'sales',
    phone varchar(32),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sales_pipeline (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(120) NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pipeline_stage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id uuid NOT NULL REFERENCES sales_pipeline(id) ON DELETE CASCADE,
    name varchar(120) NOT NULL,
    sort_order integer NOT NULL CHECK (sort_order > 0),
    probability numeric(5,2) NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    is_won_stage boolean NOT NULL DEFAULT false,
    is_lost_stage boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (pipeline_id, name),
    UNIQUE (pipeline_id, sort_order),
    CHECK (NOT (is_won_stage AND is_lost_stage))
);

CREATE TABLE customer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES app_user(id) ON DELETE SET NULL,
    code varchar(32) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    type customer_type NOT NULL,
    tax_code varchar(64) UNIQUE,
    email varchar(255),
    phone varchar(32),
    status customer_status NOT NULL DEFAULT 'lead',
    credit_limit numeric(18,2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
    payment_term_days integer NOT NULL DEFAULT 0 CHECK (payment_term_days >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customer_contact (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    name varchar(120) NOT NULL,
    title varchar(120),
    email varchar(255),
    phone varchar(32),
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customer_address (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    type address_type NOT NULL,
    line1 varchar(255) NOT NULL,
    line2 varchar(255),
    ward varchar(120),
    district varchar(120),
    city varchar(120) NOT NULL,
    country varchar(120) NOT NULL DEFAULT 'Vietnam',
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE opportunity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
    owner_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
    stage_id uuid NOT NULL REFERENCES pipeline_stage(id) ON DELETE RESTRICT,
    code varchar(32) NOT NULL UNIQUE,
    title varchar(200) NOT NULL,
    estimated_value numeric(18,2) NOT NULL DEFAULT 0 CHECK (estimated_value >= 0),
    expected_close_date date,
    source varchar(120),
    status opportunity_status NOT NULL DEFAULT 'open',
    lost_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((status = 'lost' AND lost_reason IS NOT NULL) OR status <> 'lost')
);

CREATE TABLE product_category (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id uuid REFERENCES product_category(id) ON DELETE SET NULL,
    name varchar(120) NOT NULL UNIQUE,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE TABLE product (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES product_category(id) ON DELETE SET NULL,
    sku varchar(64) NOT NULL UNIQUE,
    name varchar(200) NOT NULL,
    unit varchar(32) NOT NULL,
    list_price numeric(18,2) NOT NULL CHECK (list_price >= 0),
    cost_price numeric(18,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    tax_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    reorder_level integer NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quote (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
    opportunity_id uuid REFERENCES opportunity(id) ON DELETE SET NULL,
    created_by_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
    code varchar(32) NOT NULL UNIQUE,
    status quote_status NOT NULL DEFAULT 'draft',
    quote_date date NOT NULL DEFAULT CURRENT_DATE,
    valid_until date,
    subtotal numeric(18,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (valid_until IS NULL OR valid_until >= quote_date)
);

CREATE TABLE quote_item (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id uuid NOT NULL REFERENCES quote(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(18,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    line_total numeric(18,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE sales_order (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customer(id) ON DELETE RESTRICT,
    quote_id uuid UNIQUE REFERENCES quote(id) ON DELETE SET NULL,
    created_by_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
    billing_address_id uuid REFERENCES customer_address(id) ON DELETE SET NULL,
    shipping_address_id uuid REFERENCES customer_address(id) ON DELETE SET NULL,
    code varchar(32) NOT NULL UNIQUE,
    status sales_order_status NOT NULL DEFAULT 'draft',
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date date,
    subtotal numeric(18,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (expected_delivery_date IS NULL OR expected_delivery_date >= order_date)
);

CREATE TABLE sales_order_item (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id uuid NOT NULL REFERENCES sales_order(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(18,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    line_total numeric(18,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE warehouse (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(32) NOT NULL UNIQUE,
    name varchar(120) NOT NULL,
    address text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory_balance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id uuid NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    quantity_on_hand integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (warehouse_id, product_id),
    CHECK (quantity_reserved <= quantity_on_hand),
    CHECK (quantity_available = quantity_on_hand - quantity_reserved)
);

CREATE TABLE inventory_movement (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id uuid NOT NULL REFERENCES warehouse(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    type inventory_movement_type NOT NULL,
    quantity integer NOT NULL CHECK (quantity <> 0),
    reference_type varchar(64),
    reference_id uuid,
    note text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE delivery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id uuid NOT NULL REFERENCES sales_order(id) ON DELETE CASCADE,
    code varchar(32) NOT NULL UNIQUE,
    status delivery_status NOT NULL DEFAULT 'pending',
    planned_date date,
    shipped_date date,
    delivered_date date,
    carrier varchar(120),
    tracking_number varchar(120),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (shipped_date IS NULL OR planned_date IS NULL OR shipped_date >= planned_date),
    CHECK (delivered_date IS NULL OR shipped_date IS NULL OR delivered_date >= shipped_date)
);

CREATE TABLE invoice (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id uuid NOT NULL UNIQUE REFERENCES sales_order(id) ON DELETE RESTRICT,
    code varchar(32) NOT NULL UNIQUE,
    status invoice_status NOT NULL DEFAULT 'draft',
    issued_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    subtotal numeric(18,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount numeric(18,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount numeric(18,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (due_date >= issued_date),
    CHECK (paid_amount <= total_amount)
);

CREATE TABLE payment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL REFERENCES invoice(id) ON DELETE RESTRICT,
    code varchar(32) NOT NULL UNIQUE,
    method payment_method NOT NULL,
    amount numeric(18,2) NOT NULL CHECK (amount > 0),
    paid_date date NOT NULL DEFAULT CURRENT_DATE,
    transaction_ref varchar(120),
    status payment_status NOT NULL DEFAULT 'pending',
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES app_user(id) ON DELETE SET NULL,
    entity_type varchar(64) NOT NULL,
    entity_id uuid NOT NULL,
    action varchar(64) NOT NULL,
    ip_address inet,
    user_agent text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_customer_primary_contact
    ON customer_contact(customer_id)
    WHERE is_primary;

CREATE UNIQUE INDEX uq_customer_default_address_by_type
    ON customer_address(customer_id, type)
    WHERE is_default;

CREATE INDEX idx_customer_owner_id ON customer(owner_id);
CREATE INDEX idx_customer_status ON customer(status);
CREATE INDEX idx_customer_name ON customer(name);
CREATE INDEX idx_opportunity_customer_id ON opportunity(customer_id);
CREATE INDEX idx_opportunity_owner_id ON opportunity(owner_id);
CREATE INDEX idx_opportunity_stage_id ON opportunity(stage_id);
CREATE INDEX idx_opportunity_status ON opportunity(status);
CREATE INDEX idx_product_category_id ON product(category_id);
CREATE INDEX idx_quote_customer_id ON quote(customer_id);
CREATE INDEX idx_quote_opportunity_id ON quote(opportunity_id);
CREATE INDEX idx_quote_status ON quote(status);
CREATE INDEX idx_sales_order_customer_id ON sales_order(customer_id);
CREATE INDEX idx_sales_order_status ON sales_order(status);
CREATE INDEX idx_sales_order_item_product_id ON sales_order_item(product_id);
CREATE INDEX idx_inventory_balance_product_id ON inventory_balance(product_id);
CREATE INDEX idx_inventory_movement_product_id ON inventory_movement(product_id);
CREATE INDEX idx_inventory_movement_reference ON inventory_movement(reference_type, reference_id);
CREATE INDEX idx_delivery_sales_order_id ON delivery(sales_order_id);
CREATE INDEX idx_invoice_status ON invoice(status);
CREATE INDEX idx_payment_invoice_id ON payment(invoice_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_actor_id ON activity_log(actor_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

CREATE TRIGGER trg_app_user_updated_at
    BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sales_pipeline_updated_at
    BEFORE UPDATE ON sales_pipeline
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pipeline_stage_updated_at
    BEFORE UPDATE ON pipeline_stage
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_updated_at
    BEFORE UPDATE ON customer
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_contact_updated_at
    BEFORE UPDATE ON customer_contact
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_address_updated_at
    BEFORE UPDATE ON customer_address
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_opportunity_updated_at
    BEFORE UPDATE ON opportunity
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_category_updated_at
    BEFORE UPDATE ON product_category
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_updated_at
    BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_quote_updated_at
    BEFORE UPDATE ON quote
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sales_order_updated_at
    BEFORE UPDATE ON sales_order
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_warehouse_updated_at
    BEFORE UPDATE ON warehouse
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_delivery_updated_at
    BEFORE UPDATE ON delivery
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoice_updated_at
    BEFORE UPDATE ON invoice
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payment_updated_at
    BEFORE UPDATE ON payment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
