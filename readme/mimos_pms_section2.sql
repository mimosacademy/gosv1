
-- ============================================================
-- MIMOS ACADEMY PROJECT MANAGEMENT SYSTEM (PMS)
-- PRODUCTION-READY MySQL 8.0+ SQL SCRIPT
-- SECTION 2: Programme, Quotation, Purchase Order, Invoice, Payment
-- Target: Hostinger MySQL
-- ============================================================

USE mimos_pms;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. PROGRAMME TABLE (Central Entity)
-- ============================================================

CREATE TABLE programme (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    programme_code          VARCHAR(50),
    title                   VARCHAR(500) NOT NULL,
    description             TEXT,

    -- Foreign Keys
    client_id               BIGINT UNSIGNED NOT NULL,
    training_type_id        BIGINT UNSIGNED,
    programme_category_id   BIGINT UNSIGNED,
    programme_status_id     BIGINT UNSIGNED,
    account_id              BIGINT UNSIGNED,
    account_manager_id      BIGINT UNSIGNED,
    pic_id                  BIGINT UNSIGNED,

    -- Training Details
    duration_days           DECIMAL(5,2),
    no_of_pax               INT UNSIGNED,
    start_date              DATE,
    end_date                DATE,

    -- Financial Summary (stored for quick reference, derived from invoices)
    total_revenue_excl_tax  DECIMAL(15,2) DEFAULT 0.00,
    total_sst_amount        DECIMAL(15,2) DEFAULT 0.00,
    total_revenue_incl_tax  DECIMAL(15,2) DEFAULT 0.00,
    total_collected         DECIMAL(15,2) DEFAULT 0.00,
    total_outstanding       DECIMAL(15,2) DEFAULT 0.00,

    -- Programme Classification
    is_public_training      BOOLEAN DEFAULT FALSE,
    is_in_house           BOOLEAN DEFAULT FALSE,
    is_internal           BOOLEAN DEFAULT FALSE,

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_programme_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_programme_training_type
        FOREIGN KEY (training_type_id) REFERENCES training_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_category
        FOREIGN KEY (programme_category_id) REFERENCES programme_category(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_status
        FOREIGN KEY (programme_status_id) REFERENCES programme_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_account
        FOREIGN KEY (account_id) REFERENCES account(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_account_manager
        FOREIGN KEY (account_manager_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_pic
        FOREIGN KEY (pic_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_programme_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_programme_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_programme_duration
        CHECK (duration_days IS NULL OR duration_days >= 0),
    CONSTRAINT chk_programme_pax
        CHECK (no_of_pax IS NULL OR no_of_pax >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Programme
CREATE INDEX idx_programme_client ON programme(client_id);
CREATE INDEX idx_programme_status ON programme(programme_status_id);
CREATE INDEX idx_programme_training_type ON programme(training_type_id);
CREATE INDEX idx_programme_account_manager ON programme(account_manager_id);
CREATE INDEX idx_programme_pic ON programme(pic_id);
CREATE INDEX idx_programme_dates ON programme(start_date, end_date);
CREATE INDEX idx_programme_title ON programme(title);
CREATE INDEX idx_programme_code ON programme(programme_code);
CREATE INDEX idx_programme_import_batch ON programme(import_batch_id);

-- Composite index for deduplication matching
CREATE INDEX idx_programme_match ON programme(client_id, title, start_date, end_date);

-- ============================================================
-- 2. QUOTATION TABLE
-- ============================================================

CREATE TABLE quotation (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quotation_no            VARCHAR(100) NOT NULL,
    revision                VARCHAR(20) DEFAULT '0',

    -- Foreign Keys
    programme_id            BIGINT UNSIGNED,
    client_id               BIGINT UNSIGNED NOT NULL,
    quotation_type_id       BIGINT UNSIGNED,
    training_type_id        BIGINT UNSIGNED,
    quotation_status_id     BIGINT UNSIGNED,
    account_manager_id      BIGINT UNSIGNED,
    pic_id                  BIGINT UNSIGNED,
    account_id              BIGINT UNSIGNED,

    -- Programme Details
    project_title           VARCHAR(500),
    duration_days           DECIMAL(5,2),
    no_of_unit              INT UNSIGNED,

    -- Financial Breakdown
    unit_price_excl_tax     DECIMAL(15,4),
    unit_price_incl_tax     DECIMAL(15,4),
    total_price_excl_tax    DECIMAL(15,2),
    total_price_incl_tax    DECIMAL(15,2),
    sst_amount              DECIMAL(15,2),
    sst_rate                DECIMAL(5,4) DEFAULT 0.08,
    discount_percentage     DECIMAL(5,2) DEFAULT 0.00,
    discount_amount         DECIMAL(15,2) DEFAULT 0.00,
    final_price             DECIMAL(15,2),
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Status & Dates
    quotation_date          DATE,
    valid_until             DATE,

    -- PIC Contact (from quotation tracker)
    pic_full_name           VARCHAR(100),
    pic_contact_no          VARCHAR(50),
    pic_email               VARCHAR(255),

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_quotation_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_type
        FOREIGN KEY (quotation_type_id) REFERENCES quotation_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_training_type
        FOREIGN KEY (training_type_id) REFERENCES training_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_status
        FOREIGN KEY (quotation_status_id) REFERENCES quotation_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_account_manager
        FOREIGN KEY (account_manager_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_pic
        FOREIGN KEY (pic_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_account
        FOREIGN KEY (account_id) REFERENCES account(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotation_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_quotation_sst_rate
        CHECK (sst_rate >= 0 AND sst_rate <= 1),
    CONSTRAINT chk_quotation_discount
        CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CONSTRAINT chk_quotation_unit_price
        CHECK (unit_price_excl_tax IS NULL OR unit_price_excl_tax >= 0),
    CONSTRAINT chk_quotation_final_price
        CHECK (final_price IS NULL OR final_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Quotation
CREATE INDEX idx_quotation_no ON quotation(quotation_no);
CREATE INDEX idx_quotation_programme ON quotation(programme_id);
CREATE INDEX idx_quotation_client ON quotation(client_id);
CREATE INDEX idx_quotation_status ON quotation(quotation_status_id);
CREATE INDEX idx_quotation_date ON quotation(quotation_date);
CREATE INDEX idx_quotation_account_manager ON quotation(account_manager_id);
CREATE INDEX idx_quotation_import_batch ON quotation(import_batch_id);

-- Composite index for deduplication
CREATE INDEX idx_quotation_match ON quotation(quotation_no, client_id, programme_id);

-- ============================================================
-- 3. PURCHASE ORDER TABLE
-- ============================================================

CREATE TABLE purchase_order (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    po_no                   VARCHAR(100),
    po_reference            VARCHAR(100),

    -- Foreign Keys
    programme_id            BIGINT UNSIGNED,
    quotation_id            BIGINT UNSIGNED,
    client_id               BIGINT UNSIGNED NOT NULL,
    account_id              BIGINT UNSIGNED,

    -- PO Details
    po_date                 DATE,
    po_value_excl_tax       DECIMAL(15,2),
    po_value_incl_tax       DECIMAL(15,2),
    sst_amount              DECIMAL(15,2),
    sst_rate                DECIMAL(5,4) DEFAULT 0.08,
    currency                VARCHAR(3) DEFAULT 'MYR',
    description             TEXT,

    -- Status
    po_status               VARCHAR(50),
    is_active               BOOLEAN DEFAULT TRUE,

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_po_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_po_quotation
        FOREIGN KEY (quotation_id) REFERENCES quotation(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_po_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_po_account
        FOREIGN KEY (account_id) REFERENCES account(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_po_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_po_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_po_value
        CHECK (po_value_excl_tax IS NULL OR po_value_excl_tax >= 0),
    CONSTRAINT chk_po_sst_rate
        CHECK (sst_rate >= 0 AND sst_rate <= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Purchase Order
CREATE INDEX idx_po_no ON purchase_order(po_no);
CREATE INDEX idx_po_programme ON purchase_order(programme_id);
CREATE INDEX idx_po_quotation ON purchase_order(quotation_id);
CREATE INDEX idx_po_client ON purchase_order(client_id);
CREATE INDEX idx_po_date ON purchase_order(po_date);
CREATE INDEX idx_po_import_batch ON purchase_order(import_batch_id);

-- ============================================================
-- 4. INVOICE TABLE
-- ============================================================

CREATE TABLE invoice (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_no              VARCHAR(100),
    invoice_reference       VARCHAR(100),

    -- Foreign Keys
    programme_id            BIGINT UNSIGNED NOT NULL,
    quotation_id            BIGINT UNSIGNED,
    purchase_order_id       BIGINT UNSIGNED,
    client_id               BIGINT UNSIGNED NOT NULL,
    account_id              BIGINT UNSIGNED,
    revenue_type_id         BIGINT UNSIGNED,
    payment_status_id       BIGINT UNSIGNED,
    payment_terms_id        BIGINT UNSIGNED,
    payment_method_id       BIGINT UNSIGNED,

    -- Invoice Details
    invoice_date            DATE,
    due_date                DATE,
    training_start_date     DATE,
    training_end_date       DATE,

    -- Financial Breakdown (store all three independently per QA recommendation)
    amount_excl_tax         DECIMAL(15,2),
    sst_amount              DECIMAL(15,2),
    sst_rate                DECIMAL(5,4) DEFAULT 0.08,
    total_incl_tax          DECIMAL(15,2),
    amount_collected        DECIMAL(15,2) DEFAULT 0.00,
    amount_outstanding      DECIMAL(15,2) DEFAULT 0.00,
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Payment Tracking
    payment_date            DATE,
    days_outstanding        INT,

    -- Document References
    quotation_no_ref        VARCHAR(100),
    po_no_ref               VARCHAR(100),

    -- Status Flags
    is_placeholder          BOOLEAN DEFAULT FALSE,
    is_cancelled            BOOLEAN DEFAULT FALSE,

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_invoice_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_quotation
        FOREIGN KEY (quotation_id) REFERENCES quotation(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_po
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_account
        FOREIGN KEY (account_id) REFERENCES account(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_revenue_type
        FOREIGN KEY (revenue_type_id) REFERENCES revenue_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_payment_status
        FOREIGN KEY (payment_status_id) REFERENCES payment_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_payment_terms
        FOREIGN KEY (payment_terms_id) REFERENCES payment_terms(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_invoice_amount
        CHECK (amount_excl_tax IS NULL OR amount_excl_tax >= 0),
    CONSTRAINT chk_invoice_sst
        CHECK (sst_amount IS NULL OR sst_amount >= 0),
    CONSTRAINT chk_invoice_total
        CHECK (total_incl_tax IS NULL OR total_incl_tax >= 0),
    CONSTRAINT chk_invoice_sst_rate
        CHECK (sst_rate >= 0 AND sst_rate <= 1),
    CONSTRAINT chk_invoice_dates
        CHECK (training_end_date IS NULL OR training_start_date IS NULL OR training_end_date >= training_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Invoice
CREATE INDEX idx_invoice_no ON invoice(invoice_no);
CREATE INDEX idx_invoice_programme ON invoice(programme_id);
CREATE INDEX idx_invoice_quotation ON invoice(quotation_id);
CREATE INDEX idx_invoice_client ON invoice(client_id);
CREATE INDEX idx_invoice_date ON invoice(invoice_date);
CREATE INDEX idx_invoice_due_date ON invoice(due_date);
CREATE INDEX idx_invoice_payment_status ON invoice(payment_status_id);
CREATE INDEX idx_invoice_payment_date ON invoice(payment_date);
CREATE INDEX idx_invoice_account ON invoice(account_id);
CREATE INDEX idx_invoice_import_batch ON invoice(import_batch_id);
CREATE INDEX idx_invoice_placeholder ON invoice(is_placeholder);

-- Functional index for real invoice numbers (MySQL 8.0.13+)
CREATE INDEX idx_invoice_real_no ON invoice((CASE 
    WHEN invoice_no IS NOT NULL 
         AND invoice_no NOT LIKE 'Pending @ Fin%' 
         AND invoice_no != '' 
    THEN invoice_no 
    ELSE NULL 
END));

-- Composite index for deduplication matching
CREATE INDEX idx_invoice_match ON invoice(client_id, programme_id, invoice_no, invoice_date);

-- ============================================================
-- 5. PAYMENT TABLE (Collection Events)
-- ============================================================

CREATE TABLE payment (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_reference       VARCHAR(100),

    -- Foreign Keys
    invoice_id              BIGINT UNSIGNED NOT NULL,
    programme_id            BIGINT UNSIGNED,
    client_id               BIGINT UNSIGNED,
    account_id              BIGINT UNSIGNED,
    payment_method_id       BIGINT UNSIGNED,
    payment_status_id       BIGINT UNSIGNED,
    received_by_id          BIGINT UNSIGNED,

    -- Payment Details
    payment_date            DATE,
    amount                  DECIMAL(15,2) NOT NULL,
    sst_amount              DECIMAL(15,2) DEFAULT 0.00,
    total_amount            DECIMAL(15,2),
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Allocation
    amount_allocated        DECIMAL(15,2) DEFAULT 0.00,
    amount_unallocated      DECIMAL(15,2) DEFAULT 0.00,

    -- Banking
    bank_reference          VARCHAR(100),
    cheque_no               VARCHAR(50),
    transaction_id          VARCHAR(100),

    -- Notes
    notes                   TEXT,

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_payment_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoice(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payment_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_account
        FOREIGN KEY (account_id) REFERENCES account(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_status
        FOREIGN KEY (payment_status_id) REFERENCES payment_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_received_by
        FOREIGN KEY (received_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0),
    CONSTRAINT chk_payment_sst
        CHECK (sst_amount >= 0),
    CONSTRAINT chk_payment_total
        CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Payment
CREATE INDEX idx_payment_invoice ON payment(invoice_id);
CREATE INDEX idx_payment_programme ON payment(programme_id);
CREATE INDEX idx_payment_client ON payment(client_id);
CREATE INDEX idx_payment_date ON payment(payment_date);
CREATE INDEX idx_payment_reference ON payment(payment_reference);
CREATE INDEX idx_payment_method ON payment(payment_method_id);
CREATE INDEX idx_payment_status ON payment(payment_status_id);
CREATE INDEX idx_payment_import_batch ON payment(import_batch_id);

-- ============================================================
-- 6. INVOICE PAYMENT ALLOCATION TABLE (Many-to-Many)
-- ============================================================

CREATE TABLE invoice_payment_allocation (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id              BIGINT UNSIGNED NOT NULL,
    payment_id              BIGINT UNSIGNED NOT NULL,
    allocated_amount        DECIMAL(15,2) NOT NULL,
    allocation_date         DATE,
    notes                   TEXT,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,

    CONSTRAINT fk_alloc_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoice(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alloc_payment
        FOREIGN KEY (payment_id) REFERENCES payment(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_alloc_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_alloc_amount
        CHECK (allocated_amount > 0),

    UNIQUE KEY uk_alloc_invoice_payment (invoice_id, payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX idx_alloc_payment ON invoice_payment_allocation(payment_id);

-- ============================================================
-- 7. PROGRAMME FINANCIAL SUMMARY VIEW TRIGGER
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_update_programme_financials_after_invoice
AFTER INSERT ON invoice
FOR EACH ROW
BEGIN
    UPDATE programme p
    SET 
        total_revenue_excl_tax = (
            SELECT COALESCE(SUM(amount_excl_tax), 0)
            FROM invoice i
            WHERE i.programme_id = p.id
            AND i.is_cancelled = FALSE
            AND i.is_placeholder = FALSE
        ),
        total_sst_amount = (
            SELECT COALESCE(SUM(sst_amount), 0)
            FROM invoice i
            WHERE i.programme_id = p.id
            AND i.is_cancelled = FALSE
            AND i.is_placeholder = FALSE
        ),
        total_revenue_incl_tax = (
            SELECT COALESCE(SUM(total_incl_tax), 0)
            FROM invoice i
            WHERE i.programme_id = p.id
            AND i.is_cancelled = FALSE
            AND i.is_placeholder = FALSE
        ),
        total_outstanding = (
            SELECT COALESCE(SUM(amount_outstanding), 0)
            FROM invoice i
            WHERE i.programme_id = p.id
            AND i.is_cancelled = FALSE
            AND i.is_placeholder = FALSE
        )
    WHERE p.id = NEW.programme_id;
END //

CREATE TRIGGER trg_update_programme_financials_after_invoice_update
AFTER UPDATE ON invoice
FOR EACH ROW
BEGIN
    IF OLD.programme_id IS NOT NULL THEN
        UPDATE programme p
        SET 
            total_revenue_excl_tax = (
                SELECT COALESCE(SUM(amount_excl_tax), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_sst_amount = (
                SELECT COALESCE(SUM(sst_amount), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_revenue_incl_tax = (
                SELECT COALESCE(SUM(total_incl_tax), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_outstanding = (
                SELECT COALESCE(SUM(amount_outstanding), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            )
        WHERE p.id = OLD.programme_id;
    END IF;

    IF NEW.programme_id IS NOT NULL AND NEW.programme_id != OLD.programme_id THEN
        UPDATE programme p
        SET 
            total_revenue_excl_tax = (
                SELECT COALESCE(SUM(amount_excl_tax), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_sst_amount = (
                SELECT COALESCE(SUM(sst_amount), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_revenue_incl_tax = (
                SELECT COALESCE(SUM(total_incl_tax), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            ),
            total_outstanding = (
                SELECT COALESCE(SUM(amount_outstanding), 0)
                FROM invoice i
                WHERE i.programme_id = p.id
                AND i.is_cancelled = FALSE
                AND i.is_placeholder = FALSE
            )
        WHERE p.id = NEW.programme_id;
    END IF;
END //

CREATE TRIGGER trg_update_programme_collected_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    IF NEW.programme_id IS NOT NULL THEN
        UPDATE programme p
        SET total_collected = (
            SELECT COALESCE(SUM(amount), 0)
            FROM payment py
            WHERE py.programme_id = p.id
            AND py.payment_status_id = (SELECT id FROM payment_status WHERE code = 'PAID')
        )
        WHERE p.id = NEW.programme_id;
    END IF;
END //

CREATE TRIGGER trg_update_programme_collected_after_payment_update
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    IF OLD.programme_id IS NOT NULL THEN
        UPDATE programme p
        SET total_collected = (
            SELECT COALESCE(SUM(amount), 0)
            FROM payment py
            WHERE py.programme_id = p.id
            AND py.payment_status_id = (SELECT id FROM payment_status WHERE code = 'PAID')
        )
        WHERE p.id = OLD.programme_id;
    END IF;

    IF NEW.programme_id IS NOT NULL AND NEW.programme_id != OLD.programme_id THEN
        UPDATE programme p
        SET total_collected = (
            SELECT COALESCE(SUM(amount), 0)
            FROM payment py
            WHERE py.programme_id = p.id
            AND py.payment_status_id = (SELECT id FROM payment_status WHERE code = 'PAID')
        )
        WHERE p.id = NEW.programme_id;
    END IF;
END //

DELIMITER ;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SECTION 2
-- ============================================================
