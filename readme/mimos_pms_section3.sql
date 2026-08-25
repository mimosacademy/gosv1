
-- ============================================================
-- MIMOS ACADEMY PROJECT MANAGEMENT SYSTEM (PMS)
-- PRODUCTION-READY MySQL 8.0+ SQL SCRIPT
-- SECTION 3: Funnel, Action Item, Training Stat, Audit Tables
-- Target: Hostinger MySQL
-- ============================================================

USE mimos_pms;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. OPPORTUNITY / FUNNEL TABLE
-- ============================================================

CREATE TABLE opportunity (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    opportunity_code        VARCHAR(50),

    -- Foreign Keys
    client_id               BIGINT UNSIGNED NOT NULL,
    programme_id            BIGINT UNSIGNED,
    opportunity_status_id   BIGINT UNSIGNED,
    speed_to_market_id      BIGINT UNSIGNED,
    sector_id               BIGINT UNSIGNED,
    account_manager_id      BIGINT UNSIGNED,
    salesman_id             BIGINT UNSIGNED,

    -- Opportunity Details
    project_title           VARCHAR(500) NOT NULL,
    project_description     TEXT,
    opportunity_type        VARCHAR(100),

    -- Financial Forecast
    forecast_value          DECIMAL(15,2),
    probability_percentage  DECIMAL(5,2),
    weighted_value          DECIMAL(15,2),
    secured_value           DECIMAL(15,2),
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Pipeline Tracking
    expected_close_date     DATE,
    actual_close_date       DATE,
    po_date                 DATE,
    po_value                DECIMAL(15,2),

    -- Classification
    is_government           BOOLEAN DEFAULT FALSE,
    is_private              BOOLEAN DEFAULT FALSE,
    is_interco            BOOLEAN DEFAULT FALSE,

    -- Remarks & Notes
    remarks                 TEXT,
    sector_remarks          VARCHAR(255),

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_opportunity_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_status
        FOREIGN KEY (opportunity_status_id) REFERENCES opportunity_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_speed
        FOREIGN KEY (speed_to_market_id) REFERENCES speed_to_market(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_sector
        FOREIGN KEY (sector_id) REFERENCES sector(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_account_manager
        FOREIGN KEY (account_manager_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_salesman
        FOREIGN KEY (salesman_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_opportunity_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_opportunity_forecast
        CHECK (forecast_value IS NULL OR forecast_value >= 0),
    CONSTRAINT chk_opportunity_probability
        CHECK (probability_percentage IS NULL OR (probability_percentage >= 0 AND probability_percentage <= 100)),
    CONSTRAINT chk_opportunity_weighted
        CHECK (weighted_value IS NULL OR weighted_value >= 0),
    CONSTRAINT chk_opportunity_secured
        CHECK (secured_value IS NULL OR secured_value >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Opportunity
CREATE INDEX idx_opportunity_client ON opportunity(client_id);
CREATE INDEX idx_opportunity_programme ON opportunity(programme_id);
CREATE INDEX idx_opportunity_status ON opportunity(opportunity_status_id);
CREATE INDEX idx_opportunity_speed ON opportunity(speed_to_market_id);
CREATE INDEX idx_opportunity_sector ON opportunity(sector_id);
CREATE INDEX idx_opportunity_account_manager ON opportunity(account_manager_id);
CREATE INDEX idx_opportunity_salesman ON opportunity(salesman_id);
CREATE INDEX idx_opportunity_close_date ON opportunity(expected_close_date);
CREATE INDEX idx_opportunity_code ON opportunity(opportunity_code);
CREATE INDEX idx_opportunity_import_batch ON opportunity(import_batch_id);

-- Composite index for deduplication
CREATE INDEX idx_opportunity_match ON opportunity(client_id, project_title, forecast_value);

-- ============================================================
-- 2. ACTION ITEM TABLE (Operational Tasks)
-- ============================================================

CREATE TABLE action_item (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    action_item_code        VARCHAR(50),

    -- Foreign Keys
    client_id               BIGINT UNSIGNED,
    programme_id            BIGINT UNSIGNED,
    opportunity_id          BIGINT UNSIGNED,
    invoice_id              BIGINT UNSIGNED,
    assigned_to_id          BIGINT UNSIGNED,
    action_item_status_id   BIGINT UNSIGNED,
    service_type_id         BIGINT UNSIGNED,

    -- Action Details
    service                 VARCHAR(255),
    action_description      TEXT NOT NULL,
    person_in_charge        VARCHAR(100),
    person_email            VARCHAR(255),

    -- Scheduling
    due_date                DATE,
    completed_date          DATE,

    -- Financial
    potential_revenue       DECIMAL(15,2),
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Tracking
    aging_days              INT,
    priority                VARCHAR(20) DEFAULT 'MEDIUM',

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
    CONSTRAINT fk_action_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_opportunity
        FOREIGN KEY (opportunity_id) REFERENCES opportunity(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoice(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_assigned_to
        FOREIGN KEY (assigned_to_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_status
        FOREIGN KEY (action_item_status_id) REFERENCES action_item_status(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_service_type
        FOREIGN KEY (service_type_id) REFERENCES service_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_action_revenue
        CHECK (potential_revenue IS NULL OR potential_revenue >= 0),
    CONSTRAINT chk_action_aging
        CHECK (aging_days IS NULL OR aging_days >= 0),
    CONSTRAINT chk_action_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Action Item
CREATE INDEX idx_action_client ON action_item(client_id);
CREATE INDEX idx_action_programme ON action_item(programme_id);
CREATE INDEX idx_action_opportunity ON action_item(opportunity_id);
CREATE INDEX idx_action_invoice ON action_item(invoice_id);
CREATE INDEX idx_action_assigned ON action_item(assigned_to_id);
CREATE INDEX idx_action_status ON action_item(action_item_status_id);
CREATE INDEX idx_action_due_date ON action_item(due_date);
CREATE INDEX idx_action_completed_date ON action_item(completed_date);
CREATE INDEX idx_action_code ON action_item(action_item_code);
CREATE INDEX idx_action_import_batch ON action_item(import_batch_id);

-- ============================================================
-- 3. TRAINING STATISTICS TABLE (Normalized from R2)
-- ============================================================

CREATE TABLE training_stat (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Foreign Keys
    programme_id            BIGINT UNSIGNED NOT NULL,
    training_type_id        BIGINT UNSIGNED,

    -- Training Details
    training_date           DATE,
    training_name           VARCHAR(500),
    company_name            VARCHAR(255),
    training_category       VARCHAR(100),
    duration_days           DECIMAL(5,2),

    -- Participant Counts by Domain
    domain_code             VARCHAR(50),
    domain_name             VARCHAR(100),
    workshop_count          INT UNSIGNED DEFAULT 0,
    training_count          INT UNSIGNED DEFAULT 0,
    total_count             INT UNSIGNED DEFAULT 0,

    -- Demographics
    bumiputera_count        INT UNSIGNED DEFAULT 0,
    non_bumiputera_count    INT UNSIGNED DEFAULT 0,

    -- Financial
    total_charges_excl_tax  DECIMAL(15,2),
    sst_amount              DECIMAL(15,2),
    final_charges_incl_tax  DECIMAL(15,2),
    currency                VARCHAR(3) DEFAULT 'MYR',

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_training_stat_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_training_stat_training_type
        FOREIGN KEY (training_type_id) REFERENCES training_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_training_stat_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_training_stat_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_training_stat_workshop
        CHECK (workshop_count >= 0),
    CONSTRAINT chk_training_stat_training
        CHECK (training_count >= 0),
    CONSTRAINT chk_training_stat_total
        CHECK (total_count >= 0),
    CONSTRAINT chk_training_stat_bumi
        CHECK (bumiputera_count >= 0),
    CONSTRAINT chk_training_stat_non_bumi
        CHECK (non_bumiputera_count >= 0),
    CONSTRAINT chk_training_stat_charges
        CHECK (total_charges_excl_tax IS NULL OR total_charges_excl_tax >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Training Stat
CREATE INDEX idx_training_stat_programme ON training_stat(programme_id);
CREATE INDEX idx_training_stat_training_type ON training_stat(training_type_id);
CREATE INDEX idx_training_stat_date ON training_stat(training_date);
CREATE INDEX idx_training_stat_domain ON training_stat(domain_code);
CREATE INDEX idx_training_stat_company ON training_stat(company_name);
CREATE INDEX idx_training_stat_import_batch ON training_stat(import_batch_id);

-- Composite index for deduplication
CREATE INDEX idx_training_stat_match ON training_stat(programme_id, training_date, domain_code);

-- ============================================================
-- 4. PARTICIPANT TABLE (Individual Attendance)
-- ============================================================

CREATE TABLE participant (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Foreign Keys
    programme_id            BIGINT UNSIGNED NOT NULL,
    training_stat_id        BIGINT UNSIGNED,

    -- Participant Details
    full_name               VARCHAR(255) NOT NULL,
    identification_no       VARCHAR(50),
    cert_no                 VARCHAR(100),
    email                   VARCHAR(255),
    phone                   VARCHAR(50),
    designation             VARCHAR(100),
    department              VARCHAR(100),
    organization            VARCHAR(255),

    -- Demographics
    is_bumiputera           BOOLEAN,
    gender                  VARCHAR(10),

    -- Attendance
    attendance_status       VARCHAR(50) DEFAULT 'ATTENDED',
    cert_issued             BOOLEAN DEFAULT FALSE,
    cert_issue_date         DATE,

    -- Source & Audit
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,
    import_batch_id         BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by              BIGINT UNSIGNED,
    updated_by              BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_participant_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_participant_training_stat
        FOREIGN KEY (training_stat_id) REFERENCES training_stat(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_participant_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_participant_updated_by
        FOREIGN KEY (updated_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for Participant
CREATE INDEX idx_participant_programme ON participant(programme_id);
CREATE INDEX idx_participant_training_stat ON participant(training_stat_id);
CREATE INDEX idx_participant_name ON participant(full_name);
CREATE INDEX idx_participant_cert ON participant(cert_no);
CREATE INDEX idx_participant_bumi ON participant(is_bumiputera);
CREATE INDEX idx_participant_import_batch ON participant(import_batch_id);

-- ============================================================
-- 5. AUDIT TABLES
-- ============================================================

-- 5.1 Source File Table
CREATE TABLE source_file (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name               VARCHAR(255) NOT NULL,
    file_path               VARCHAR(500),
    file_hash               VARCHAR(64) NOT NULL,
    file_size_bytes         BIGINT UNSIGNED,
    file_type               VARCHAR(50),
    upload_date             DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    uploaded_by_id          BIGINT UNSIGNED,
    description             TEXT,
    is_processed            BOOLEAN DEFAULT FALSE,
    processed_at            DATETIME(6),

    CONSTRAINT fk_source_file_uploaded_by
        FOREIGN KEY (uploaded_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_source_file_hash (file_hash),
    INDEX idx_source_file_name (file_name),
    INDEX idx_source_file_processed (is_processed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.2 Import Batch Table
CREATE TABLE import_batch (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    batch_code              VARCHAR(50) NOT NULL UNIQUE,

    -- Source Reference
    source_file_id          BIGINT UNSIGNED,

    -- Import Details
    import_type             VARCHAR(50) NOT NULL,
    table_target            VARCHAR(100) NOT NULL,
    records_total           INT UNSIGNED DEFAULT 0,
    records_inserted        INT UNSIGNED DEFAULT 0,
    records_updated         INT UNSIGNED DEFAULT 0,
    records_skipped         INT UNSIGNED DEFAULT 0,
    records_failed          INT UNSIGNED DEFAULT 0,
    records_in_review       INT UNSIGNED DEFAULT 0,

    -- Status
    status                  VARCHAR(50) DEFAULT 'PENDING',
    start_time              DATETIME(6),
    end_time                DATETIME(6),

    -- Notes
    notes                   TEXT,
    error_log               TEXT,

    -- Audit
    imported_by_id          BIGINT UNSIGNED,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    -- Constraints
    CONSTRAINT fk_import_batch_source_file
        FOREIGN KEY (source_file_id) REFERENCES source_file(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_import_batch_imported_by
        FOREIGN KEY (imported_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_import_batch_code (batch_code),
    INDEX idx_import_batch_status (status),
    INDEX idx_import_batch_type (import_type),
    INDEX idx_import_batch_target (table_target),
    INDEX idx_import_batch_source_file (source_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.3 Audit Log Table (Field-Level Changes)
CREATE TABLE audit_log (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Target Reference
    table_name              VARCHAR(100) NOT NULL,
    record_id               BIGINT UNSIGNED NOT NULL,

    -- Change Details
    field_name              VARCHAR(100) NOT NULL,
    old_value               TEXT,
    new_value               TEXT,
    change_type             VARCHAR(20) NOT NULL,

    -- Context
    action                  VARCHAR(50) NOT NULL,
    ip_address              VARCHAR(45),
    user_agent              VARCHAR(500),

    -- Audit
    performed_by_id         BIGINT UNSIGNED,
    performed_at            DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),

    -- Constraints
    CONSTRAINT fk_audit_performed_by
        FOREIGN KEY (performed_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_audit_table_record ON audit_log(table_name, record_id),
    INDEX idx_audit_field ON audit_log(field_name),
    INDEX idx_audit_change_type ON audit_log(change_type),
    INDEX idx_audit_performed_by ON audit_log(performed_by_id),
    INDEX idx_audit_performed_at ON audit_log(performed_at),
    INDEX idx_audit_action ON audit_log(action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.4 Data Quality / Conflict Queue Table
CREATE TABLE data_conflict (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Source Reference
    import_batch_id         BIGINT UNSIGNED,
    source_file             VARCHAR(255),
    source_row_number       INT UNSIGNED,

    -- Target Reference
    table_name              VARCHAR(100) NOT NULL,
    target_record_id        BIGINT UNSIGNED,

    -- Conflict Details
    conflict_type           VARCHAR(50) NOT NULL,
    field_name              VARCHAR(100),
    source_value            TEXT,
    existing_value          TEXT,
    conflict_description    TEXT,

    -- Resolution
    resolution_status       VARCHAR(50) DEFAULT 'OPEN',
    resolution_action       VARCHAR(50),
    resolved_value          TEXT,
    resolved_by_id          BIGINT UNSIGNED,
    resolved_at             DATETIME(6),

    -- Notes
    notes                   TEXT,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    -- Constraints
    CONSTRAINT fk_conflict_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_conflict_resolved_by
        FOREIGN KEY (resolved_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_conflict_batch ON data_conflict(import_batch_id),
    INDEX idx_conflict_table ON data_conflict(table_name),
    INDEX idx_conflict_status ON data_conflict(resolution_status),
    INDEX idx_conflict_type ON data_conflict(conflict_type),
    INDEX idx_conflict_target ON data_conflict(target_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.5 Completeness Score Table
CREATE TABLE completeness_score (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Target Reference
    programme_id            BIGINT UNSIGNED NOT NULL,

    -- Component Scores (each 0-100)
    quotation_score         INT UNSIGNED DEFAULT 0,
    po_score                INT UNSIGNED DEFAULT 0,
    invoice_score           INT UNSIGNED DEFAULT 0,
    payment_score           INT UNSIGNED DEFAULT 0,
    delivery_score          INT UNSIGNED DEFAULT 0,
    participant_score       INT UNSIGNED DEFAULT 0,
    charges_score           INT UNSIGNED DEFAULT 0,
    pic_score               INT UNSIGNED DEFAULT 0,

    -- Overall Score
    overall_score           INT UNSIGNED DEFAULT 0,
    overall_status          VARCHAR(20) DEFAULT 'INCOMPLETE',

    -- Missing Components List
    missing_components      JSON,
    na_components           JSON,

    -- Audit
    evaluated_at            DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    evaluated_by_id         BIGINT UNSIGNED,

    -- Constraints
    CONSTRAINT fk_completeness_programme
        FOREIGN KEY (programme_id) REFERENCES programme(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_completeness_evaluated_by
        FOREIGN KEY (evaluated_by_id) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    UNIQUE KEY uk_completeness_programme (programme_id),
    INDEX idx_completeness_overall ON completeness_score(overall_score),
    INDEX idx_completeness_status ON completeness_score(overall_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.6 Staff Alias Mapping Table (for name normalization)
CREATE TABLE staff_alias (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id                BIGINT UNSIGNED NOT NULL,
    alias_name              VARCHAR(100) NOT NULL,
    source_file             VARCHAR(255),
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_alias_staff
        FOREIGN KEY (staff_id) REFERENCES staff(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_staff_alias (staff_id, alias_name),
    INDEX idx_alias_name ON staff_alias(alias_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5.7 Client Alias Mapping Table (for name normalization)
CREATE TABLE client_alias (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id               BIGINT UNSIGNED NOT NULL,
    alias_name              VARCHAR(255) NOT NULL,
    source_file             VARCHAR(255),
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_alias_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE KEY uk_client_alias (client_id, alias_name),
    INDEX idx_client_alias_name ON client_alias(alias_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 6. STAGING TABLES (for raw Excel import)
-- ============================================================

-- 6.1 Staging Invoice Table
CREATE TABLE stg_invoice (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_no                  VARCHAR(50),
    raw_company_name        VARCHAR(255),
    raw_title               VARCHAR(500),
    raw_revenue_type        VARCHAR(100),
    raw_start_date          VARCHAR(50),
    raw_end_date            VARCHAR(50),
    raw_quotation_no        VARCHAR(100),
    raw_po_no               VARCHAR(100),
    raw_po_value            VARCHAR(50),
    raw_invoice_no          VARCHAR(100),
    raw_invoice_value       VARCHAR(50),
    raw_sst_amount          VARCHAR(50),
    raw_total_value         VARCHAR(50),
    raw_amount_collected    VARCHAR(50),
    raw_invoice_date        VARCHAR(50),
    raw_payment_terms       VARCHAR(50),
    raw_due_date            VARCHAR(50),
    raw_days_outstanding    VARCHAR(50),
    raw_payment_method      VARCHAR(100),
    raw_payment_status      VARCHAR(50),
    raw_payment_date        VARCHAR(50),
    raw_account             VARCHAR(50),
    raw_status              VARCHAR(50),
    raw_account_manager     VARCHAR(100),
    raw_pic                 VARCHAR(100),
    raw_remark              TEXT,

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_programme_id     BIGINT UNSIGNED,
    mapped_client_id        BIGINT UNSIGNED,
    mapped_invoice_id       BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_invoice_batch ON stg_invoice(import_batch_id),
    INDEX idx_stg_invoice_status ON stg_invoice(validation_status),
    INDEX idx_stg_invoice_company ON stg_invoice(raw_company_name),
    INDEX idx_stg_invoice_no ON stg_invoice(raw_invoice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6.2 Staging Quotation Table
CREATE TABLE stg_quotation (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_no                  VARCHAR(50),
    raw_date                VARCHAR(50),
    raw_category            VARCHAR(100),
    raw_quotation_type      VARCHAR(100),
    raw_quotation_no        VARCHAR(100),
    raw_training_type       VARCHAR(100),
    raw_company             VARCHAR(255),
    raw_account_manager     VARCHAR(100),
    raw_project_title       VARCHAR(500),
    raw_pic_full_name       VARCHAR(100),
    raw_pic_contact         VARCHAR(50),
    raw_pic_email           VARCHAR(255),
    raw_duration_days       VARCHAR(50),
    raw_no_of_unit          VARCHAR(50),
    raw_unit_price_excl     VARCHAR(50),
    raw_unit_price_incl     VARCHAR(50),
    raw_total_price_excl    VARCHAR(50),
    raw_total_price_incl    VARCHAR(50),
    raw_sst_amount          VARCHAR(50),
    raw_discount_pct        VARCHAR(50),
    raw_final_price         VARCHAR(50),
    raw_status              VARCHAR(50),
    raw_payment_status      VARCHAR(50),
    raw_project_status      VARCHAR(50),
    raw_prepared_by         VARCHAR(100),

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_programme_id     BIGINT UNSIGNED,
    mapped_client_id        BIGINT UNSIGNED,
    mapped_quotation_id     BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_quotation_batch ON stg_quotation(import_batch_id),
    INDEX idx_stg_quotation_status ON stg_quotation(validation_status),
    INDEX idx_stg_quotation_no ON stg_quotation(raw_quotation_no),
    INDEX idx_stg_quotation_company ON stg_quotation(raw_company)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6.3 Staging Funnel Table
CREATE TABLE stg_funnel (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_no                  VARCHAR(50),
    raw_client              VARCHAR(255),
    raw_project             VARCHAR(500),
    raw_type                VARCHAR(100),
    raw_forecast_value      VARCHAR(50),
    raw_status              VARCHAR(100),
    raw_speed_to_market     VARCHAR(50),
    raw_probability         VARCHAR(50),
    raw_weighted_value      VARCHAR(50),
    raw_secured_value       VARCHAR(50),
    raw_remarks             TEXT,
    raw_sector              VARCHAR(100),
    raw_salesman            VARCHAR(100),

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_opportunity_id   BIGINT UNSIGNED,
    mapped_client_id        BIGINT UNSIGNED,
    mapped_programme_id     BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_funnel_batch ON stg_funnel(import_batch_id),
    INDEX idx_stg_funnel_status ON stg_funnel(validation_status),
    INDEX idx_stg_funnel_client ON stg_funnel(raw_client),
    INDEX idx_stg_funnel_project ON stg_funnel(raw_project)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6.4 Staging Action Item Table
CREATE TABLE stg_action_item (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_client              VARCHAR(255),
    raw_service             VARCHAR(255),
    raw_action              TEXT,
    raw_person_in_charge    VARCHAR(100),
    raw_person_email        VARCHAR(255),
    raw_due_date            VARCHAR(50),
    raw_status              VARCHAR(50),
    raw_potential_revenue   VARCHAR(50),
    raw_aging_days          VARCHAR(50),
    raw_notes               TEXT,
    raw_created_by          VARCHAR(100),
    raw_created_at          VARCHAR(50),
    raw_updated_at          VARCHAR(50),

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_action_item_id   BIGINT UNSIGNED,
    mapped_client_id        BIGINT UNSIGNED,
    mapped_programme_id     BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_action_batch ON stg_action_item(import_batch_id),
    INDEX idx_stg_action_status ON stg_action_item(validation_status),
    INDEX idx_stg_action_client ON stg_action_item(raw_client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6.5 Staging Training Stat Table
CREATE TABLE stg_training_stat (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_no                  VARCHAR(50),
    raw_date                VARCHAR(50),
    raw_training_name       VARCHAR(500),
    raw_company             VARCHAR(255),
    raw_type                VARCHAR(100),
    raw_duration            VARCHAR(50),
    raw_wafer_fab_workshop  VARCHAR(50),
    raw_wafer_fab_training  VARCHAR(50),
    raw_wafer_fab_total     VARCHAR(50),
    raw_fa_ma_workshop      VARCHAR(50),
    raw_fa_ma_training      VARCHAR(50),
    raw_fa_ma_total         VARCHAR(50),
    raw_ai_workshop         VARCHAR(50),
    raw_ai_training         VARCHAR(50),
    raw_ai_total            VARCHAR(50),
    raw_others_workshop     VARCHAR(50),
    raw_others_training     VARCHAR(50),
    raw_others_total        VARCHAR(50),
    raw_total_workshop      VARCHAR(50),
    raw_total_training      VARCHAR(50),
    raw_grand_total         VARCHAR(50),
    raw_bumiputera          VARCHAR(50),
    raw_non_bumiputera      VARCHAR(50),
    raw_total_charges       VARCHAR(50),
    raw_sst_amount          VARCHAR(50),
    raw_final_charges       VARCHAR(50),

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_programme_id     BIGINT UNSIGNED,
    mapped_training_stat_id BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_training_batch ON stg_training_stat(import_batch_id),
    INDEX idx_stg_training_status ON stg_training_stat(validation_status),
    INDEX idx_stg_training_company ON stg_training_stat(raw_company),
    INDEX idx_stg_training_name ON stg_training_stat(raw_training_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6.6 Staging Cost of Sales Table
CREATE TABLE stg_cost_of_sales (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    import_batch_id         BIGINT UNSIGNED NOT NULL,
    source_file             VARCHAR(255) NOT NULL,
    source_row_number       INT UNSIGNED NOT NULL,

    -- Raw Data Columns
    raw_no                  VARCHAR(50),
    raw_company             VARCHAR(255),
    raw_invoice_no          VARCHAR(100),
    raw_invoice_value       VARCHAR(50),
    raw_invoice_date        VARCHAR(50),
    raw_payment_date        VARCHAR(50),
    raw_collection          VARCHAR(50),
    raw_cost_of_sales       VARCHAR(50),
    raw_mimos_academy_cost  VARCHAR(50),
    raw_commission          VARCHAR(50),
    raw_bro_incentive       VARCHAR(50),
    raw_net_profit          VARCHAR(50),
    raw_profit_pct          VARCHAR(50),
    raw_revenue             VARCHAR(50),
    raw_account             VARCHAR(50),
    raw_remark              TEXT,

    -- Validation
    validation_status       VARCHAR(50) DEFAULT 'PENDING',
    validation_errors       JSON,

    -- Mapping
    mapped_programme_id     BIGINT UNSIGNED,
    mapped_invoice_id       BIGINT UNSIGNED,
    mapped_payment_id       BIGINT UNSIGNED,

    -- Audit
    created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    processed_at            DATETIME(6),
    processed_by_id         BIGINT UNSIGNED,

    INDEX idx_stg_cost_batch ON stg_cost_of_sales(import_batch_id),
    INDEX idx_stg_cost_status ON stg_cost_of_sales(validation_status),
    INDEX idx_stg_cost_company ON stg_cost_of_sales(raw_company),
    INDEX idx_stg_cost_invoice ON stg_cost_of_sales(raw_invoice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 7. UPDATE FOREIGN KEY REFERENCES FOR IMPORT_BATCH_ID
-- ============================================================

-- Add import_batch foreign key to all tables that have import_batch_id
-- Note: These are added after import_batch table exists

ALTER TABLE programme
    ADD CONSTRAINT fk_programme_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE quotation
    ADD CONSTRAINT fk_quotation_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE purchase_order
    ADD CONSTRAINT fk_po_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE invoice
    ADD CONSTRAINT fk_invoice_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE payment
    ADD CONSTRAINT fk_payment_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE opportunity
    ADD CONSTRAINT fk_opportunity_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE action_item
    ADD CONSTRAINT fk_action_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE training_stat
    ADD CONSTRAINT fk_training_stat_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE participant
    ADD CONSTRAINT fk_participant_import_batch
        FOREIGN KEY (import_batch_id) REFERENCES import_batch(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 8. TRIGGER FOR INVOICE DAYS OUTSTANDING CALCULATION
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_calc_invoice_days_outstanding
BEFORE INSERT ON invoice
FOR EACH ROW
BEGIN
    IF NEW.due_date IS NOT NULL AND NEW.payment_status_id != (SELECT id FROM payment_status WHERE code = 'PAID') THEN
        SET NEW.days_outstanding = DATEDIFF(CURDATE(), NEW.due_date);
    ELSE
        SET NEW.days_outstanding = NULL;
    END IF;
END //

CREATE TRIGGER trg_calc_invoice_days_outstanding_update
BEFORE UPDATE ON invoice
FOR EACH ROW
BEGIN
    IF NEW.due_date IS NOT NULL AND NEW.payment_status_id != (SELECT id FROM payment_status WHERE code = 'PAID') THEN
        SET NEW.days_outstanding = DATEDIFF(CURDATE(), NEW.due_date);
    ELSE
        SET NEW.days_outstanding = NULL;
    END IF;
END //

-- Trigger for weighted value calculation on opportunity
CREATE TRIGGER trg_calc_opportunity_weighted
BEFORE INSERT ON opportunity
FOR EACH ROW
BEGIN
    IF NEW.forecast_value IS NOT NULL AND NEW.probability_percentage IS NOT NULL THEN
        SET NEW.weighted_value = NEW.forecast_value * (NEW.probability_percentage / 100);
    END IF;
END //

CREATE TRIGGER trg_calc_opportunity_weighted_update
BEFORE UPDATE ON opportunity
FOR EACH ROW
BEGIN
    IF NEW.forecast_value IS NOT NULL AND NEW.probability_percentage IS NOT NULL THEN
        SET NEW.weighted_value = NEW.forecast_value * (NEW.probability_percentage / 100);
    END IF;
END //

DELIMITER ;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SECTION 3
-- ============================================================
