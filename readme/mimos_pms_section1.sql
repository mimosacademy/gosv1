
-- ============================================================
-- MIMOS ACADEMY PROJECT MANAGEMENT SYSTEM (PMS)
-- PRODUCTION-READY MySQL 8.0+ SQL SCRIPT
-- SECTION 1: Database Creation, Lookup Tables, and Master Tables
-- Target: Hostinger MySQL
-- ============================================================

-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. DATABASE CREATION
-- ============================================================

DROP DATABASE IF EXISTS mimos_pms;
CREATE DATABASE mimos_pms
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE mimos_pms;

-- ============================================================
-- 2. LOOKUP TABLES (Reference Data)
-- ============================================================

-- 2.1 Account Type Lookup
CREATE TABLE account_type (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.2 Staff Role Lookup
CREATE TABLE staff_role (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.3 Sector Lookup
CREATE TABLE sector (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.4 Training Type Lookup
CREATE TABLE training_type (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.5 Payment Method Lookup
CREATE TABLE payment_method (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.6 Payment Status Lookup
CREATE TABLE payment_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.7 Quotation Type Lookup
CREATE TABLE quotation_type (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.8 Quotation Status Lookup
CREATE TABLE quotation_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.9 Programme Status Lookup
CREATE TABLE programme_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.10 Project Status Lookup
CREATE TABLE project_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.11 Opportunity Status Lookup (Funnel Stage)
CREATE TABLE opportunity_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.12 Action Item Status Lookup
CREATE TABLE action_item_status (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.13 Payment Terms Lookup
CREATE TABLE payment_terms (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    days            INT UNSIGNED,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.14 Speed to Market Lookup
CREATE TABLE speed_to_market (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(10) NOT NULL UNIQUE,
    name            VARCHAR(50) NOT NULL,
    quarter         VARCHAR(10),
    year            YEAR,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.15 Programme Category Lookup
CREATE TABLE programme_category (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.16 Service Type Lookup
CREATE TABLE service_type (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2.17 Revenue Type Lookup
CREATE TABLE revenue_type (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3. MASTER DATA TABLES
-- ============================================================

-- 3.1 Account / Legal Entity Table
CREATE TABLE account (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code                VARCHAR(20) NOT NULL UNIQUE,
    name                VARCHAR(100) NOT NULL,
    description         VARCHAR(255),
    account_type_id     BIGINT UNSIGNED,
    is_active           BOOLEAN DEFAULT TRUE,
    source_file         VARCHAR(255),
    source_row_number   INT UNSIGNED,
    import_batch_id     BIGINT UNSIGNED,
    created_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by          BIGINT UNSIGNED,

    CONSTRAINT fk_account_type
        FOREIGN KEY (account_type_id) REFERENCES account_type(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_account_code (code),
    INDEX idx_account_name (name),
    INDEX idx_account_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3.2 Staff Table
CREATE TABLE staff (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_number        VARCHAR(50),
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    phone               VARCHAR(50),
    role_id             BIGINT UNSIGNED,
    is_active           BOOLEAN DEFAULT TRUE,
    source_file         VARCHAR(255),
    source_row_number   INT UNSIGNED,
    import_batch_id     BIGINT UNSIGNED,
    created_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by          BIGINT UNSIGNED,

    CONSTRAINT fk_staff_role
        FOREIGN KEY (role_id) REFERENCES staff_role(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_staff_email (email),
    INDEX idx_staff_name (full_name),
    INDEX idx_staff_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add self-referencing foreign key for created_by after staff exists
ALTER TABLE staff
    ADD CONSTRAINT fk_staff_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Add self-referencing for account created_by
ALTER TABLE account
    ADD CONSTRAINT fk_account_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- 3.3 Client Table
CREATE TABLE client (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name        VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    address             TEXT,
    sector_id           BIGINT UNSIGNED,
    is_active           BOOLEAN DEFAULT TRUE,
    source_file         VARCHAR(255),
    source_row_number   INT UNSIGNED,
    import_batch_id     BIGINT UNSIGNED,
    created_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by          BIGINT UNSIGNED,

    CONSTRAINT fk_client_sector
        FOREIGN KEY (sector_id) REFERENCES sector(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_client_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_client_name (company_name),
    INDEX idx_client_sector (sector_id),
    INDEX idx_client_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3.4 Client Contact Table
CREATE TABLE client_contact (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id           BIGINT UNSIGNED NOT NULL,
    contact_name        VARCHAR(100) NOT NULL,
    contact_email       VARCHAR(255),
    contact_phone       VARCHAR(50),
    contact_designation VARCHAR(100),
    is_primary          BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    source_file         VARCHAR(255),
    source_row_number   INT UNSIGNED,
    import_batch_id     BIGINT UNSIGNED,
    created_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by          BIGINT UNSIGNED,

    CONSTRAINT fk_contact_client
        FOREIGN KEY (client_id) REFERENCES client(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_contact_created_by
        FOREIGN KEY (created_by) REFERENCES staff(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_contact_client (client_id),
    INDEX idx_contact_email (contact_email),
    INDEX idx_contact_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4. SEED DATA FOR LOOKUP TABLES
-- ============================================================

-- Account Types
INSERT INTO account_type (code, name, description) VALUES
('MSSB', 'MIMOS Services Sdn Bhd', 'Primary operating subsidiary'),
('MB', 'MIMOS Berhad', 'Parent company / holding entity'),
('MIMOS', 'MIMOS Group', 'Generic MIMOS entity'),
('MH', 'MIMOS Holdings', 'Investment holding company'),
('OTHER', 'Other', 'Third party or external entity');

-- Staff Roles
INSERT INTO staff_role (code, name, description) VALUES
('MASB_TEAM', 'MASB Team', 'Core MIMOS Academy team member'),
('SUPER_ADMIN', 'Super Admin', 'System administrator with full access'),
('MANAGER', 'Manager', 'Team manager or department head'),
('PIC', 'Person In Charge', 'Assigned owner for programmes'),
('SALES', 'Sales', 'Business development and sales'),
('FINANCE', 'Finance', 'Financial operations and billing'),
('TRAINER', 'Trainer', 'Training delivery personnel'),
('INTERN', 'Intern', 'Internship or temporary staff');

-- Sectors
INSERT INTO sector (code, name, description) VALUES
('GOVT', 'Government', 'Federal, state, or local government agencies'),
('PRIVATE', 'Private Sector', 'Private companies and corporations'),
('INTERCO', 'Intercompany', 'Internal MIMOS group entities'),
('ACADEMIA', 'Academia', 'Universities, colleges, and educational institutions'),
('NGO', 'NGO / Foundation', 'Non-governmental organizations and foundations');

-- Training Types
INSERT INTO training_type (code, name, description) VALUES
('PUBLIC', 'Public Training', 'Open enrollment training programmes'),
('INHOUSE', 'In-House Training', 'Customized training at client premises'),
('ONLINE', 'Online Training', 'Virtual or remote training delivery'),
('HYBRID', 'Hybrid Training', 'Blended online and face-to-face training'),
('WORKSHOP', 'Workshop', 'Hands-on practical workshop sessions'),
('SEMINAR', 'Seminar', 'Knowledge sharing and seminar events');

-- Payment Methods
INSERT INTO payment_method (code, name, description) VALUES
('HRDCORP', 'HRDCorp Claimable', 'Training claimable through HRDCorp'),
('SELF_PAY', 'Self-Pay', 'Direct payment by client'),
('EPEROLEHAN', 'ePerolehan', 'Government e-procurement system'),
('GRANT', 'Grant Funded', 'Government or institutional grant funding'),
('INSTALLMENT', 'Installment', 'Payment by installment plan'),
('BANK_TRANSFER', 'Bank Transfer', 'Direct bank transfer payment');

-- Payment Statuses
INSERT INTO payment_status (code, name, description) VALUES
('PAID', 'Paid', 'Payment received in full'),
('UNPAID', 'Unpaid', 'Payment not yet received'),
('PENDING', 'Pending', 'Payment processing or awaiting confirmation'),
('PARTIAL', 'Partially Paid', 'Partial payment received'),
('OVERDUE', 'Overdue', 'Payment past due date'),
('CANCELLED', 'Cancelled', 'Payment cancelled or refunded'),
('UNKNOWN', 'Unknown', 'Payment status not determined');

-- Quotation Types
INSERT INTO quotation_type (code, name, description) VALUES
('TRAINING', 'Training', 'Training programme quotation'),
('CONSULTANCY', 'Consultancy', 'Consulting services quotation'),
('SERVICE', 'Service', 'General service quotation'),
('RENTAL', 'Space Rental', 'Facility or space rental quotation'),
('PRODUCT', 'Product', 'Product or equipment quotation'),
('CERT_PRINT', 'Certificate Printing', 'Certificate printing services');

-- Quotation Statuses
INSERT INTO quotation_status (code, name, description) VALUES
('SENT', 'Sent', 'Quotation sent to client'),
('IN_PROGRESS', 'In Progress', 'Quotation under preparation or revision'),
('ACCEPTED', 'Accepted', 'Quotation accepted by client'),
('REJECTED', 'Rejected', 'Quotation rejected by client'),
('EXPIRED', 'Expired', 'Quotation expired without response'),
('REVISED', 'Revised', 'Revised quotation issued'),
('WON', 'Won', 'Quotation converted to order'),
('LOST', 'Lost', 'Quotation lost to competitor');

-- Programme Statuses
INSERT INTO programme_status (code, name, description) VALUES
('PLANNED', 'Planned', 'Programme planned but not yet started'),
('CONFIRMED', 'Confirmed', 'Programme confirmed with client'),
('IN_PROGRESS', 'In Progress', 'Programme currently being delivered'),
('DELIVERED', 'Delivered', 'Programme delivery completed'),
('COMPLETED', 'Completed', 'Programme fully completed and closed'),
('CANCELLED', 'Cancelled', 'Programme cancelled'),
('POSTPONED', 'Postponed', 'Programme postponed to later date'),
('ON_HOLD', 'On Hold', 'Programme temporarily on hold');

-- Project Statuses
INSERT INTO project_status (code, name, description) VALUES
('DONE', 'Done', 'Project completed successfully'),
('FOLLOW_UP', 'Follow Up', 'Requires follow-up action'),
('IN_PROGRESS', 'In Progress', 'Project actively being worked'),
('PENDING', 'Pending', 'Awaiting input or decision'),
('CLOSED', 'Closed', 'Project closed - no further action'),
('KIV', 'KIV', 'Kept in view - under monitoring');

-- Opportunity Statuses (Funnel Stages)
INSERT INTO opportunity_status (code, name, description) VALUES
('EARLY_ENGAGEMENT', 'Early Engagement', 'Initial contact and exploration'),
('QUALIFIED_LEAD', 'Qualified Lead', 'Lead qualified and tender in progress'),
('PROPOSAL_SUBMITTED', 'Proposal Submitted', 'Proposal or tender submitted'),
('NEGOTIATION', 'Negotiation', 'Under negotiation with client'),
('VERBAL_COMMITMENT', 'Verbal Commitment', 'Verbal agreement received'),
('CONTRACT_SIGNED', 'Contract Signed / PO Issued', 'Contract signed or purchase order received'),
('LOST', 'Lost / No-go', 'Opportunity lost or declined'),
('WON', 'Won', 'Opportunity secured');

-- Action Item Statuses
INSERT INTO action_item_status (code, name, description) VALUES
('NOT_STARTED', 'Not Started', 'Action item not yet started'),
('IN_PROGRESS', 'In Progress', 'Action item actively being worked'),
('PENDING', 'Pending', 'Action item awaiting external input'),
('DONE', 'Done', 'Action item completed'),
('KIV', 'KIV', 'Kept in view - under monitoring'),
('OVERDUE', 'Overdue', 'Action item past due date'),
('CANCELLED', 'Cancelled', 'Action item cancelled');

-- Payment Terms
INSERT INTO payment_terms (code, name, days, description) VALUES
('NET_30', 'Net 30 Days', 30, 'Payment due within 30 days'),
('NET_14', 'Net 14 Days', 14, 'Payment due within 14 days'),
('NET_7', 'Net 7 Days', 7, 'Payment due within 7 days'),
('NET_60', 'Net 60 Days', 60, 'Payment due within 60 days'),
('IMMEDIATE', 'Immediate', 0, 'Immediate payment upon invoice'),
('UPON_COMPLETION', 'Upon Completion', NULL, 'Payment upon programme completion'),
('MILESTONE', 'Milestone Based', NULL, 'Payment based on milestone achievement');

-- Speed to Market
INSERT INTO speed_to_market (code, name, quarter, year, description) VALUES
('Q1_2026', 'Q1 2026', 'Q1', 2026, 'First quarter 2026'),
('Q2_2026', 'Q2 2026', 'Q2', 2026, 'Second quarter 2026'),
('Q3_2026', 'Q3 2026', 'Q3', 2026, 'Third quarter 2026'),
('Q4_2026', 'Q4 2026', 'Q4', 2026, 'Fourth quarter 2026'),
('Q1_2027', 'Q1 2027', 'Q1', 2027, 'First quarter 2027'),
('Q2_2027', 'Q2 2027', 'Q2', 2027, 'Second quarter 2027');

-- Programme Categories
INSERT INTO programme_category (code, name, description) VALUES
('AI_TRAINING', 'AI Training', 'Artificial Intelligence related training'),
('SEMICONDUCTOR', 'Semiconductor', 'Semiconductor technology training'),
('PROJECT_MGMT', 'Project Management', 'Project management training'),
('LEADERSHIP', 'Leadership', 'Leadership and management training'),
('TECHNICAL', 'Technical Skills', 'General technical skills training'),
('SOFT_SKILLS', 'Soft Skills', 'Soft skills and personal development'),
('CERTIFICATION', 'Certification', 'Professional certification programmes'),
('CONSULTANCY', 'Consultancy', 'Consulting and advisory services'),
('RENTAL', 'Space Rental', 'Facility and space rental services'),
('OTHER', 'Other', 'Other programmes and services');

-- Service Types
INSERT INTO service_type (code, name, description) VALUES
('TRAINING', 'Training', 'Training delivery service'),
('CONSULTING', 'Consulting', 'Consulting and advisory service'),
('RENTAL', 'Rental', 'Space or equipment rental'),
('CERTIFICATION', 'Certification', 'Certification and assessment service'),
('EVENT', 'Event', 'Event management and hosting'),
('PRINTING', 'Printing', 'Certificate and document printing');

-- Revenue Types
INSERT INTO revenue_type (code, name, description) VALUES
('TRAINING_AI', 'Training - AI', 'AI training revenue'),
('TRAINING_SEMI', 'Training - Semiconductor', 'Semiconductor training revenue'),
('TRAINING_GTM', 'Training - GTM', 'General training management revenue'),
('TRAINING_TTT', 'Training - TTT', 'Train-the-trainer revenue'),
('TRAINING_RD', 'Training - R&D', 'R&D related training revenue'),
('RENTAL_SPACE', 'Rental - Space', 'Space rental revenue'),
('SERVICE_OTHER', 'Service - Other', 'Other service revenue'),
('CONSULTING', 'Consulting', 'Consulting revenue'),
('PRODUCT_SALE', 'Product Sale', 'Product sales revenue');

-- ============================================================
-- 5. SEED DATA FOR MASTER TABLES
-- ============================================================

-- Staff from User Profiles Mapping
INSERT INTO staff (full_name, email, role_id, is_active) VALUES
('Zalina Sayuti', 'zalina@mimos.my', 1, TRUE),
('Siti Sarah', 'sitisarah.ramli@mimos.my', 1, TRUE),
('Abu Sa'id', 'abu.razak@mimos.my', 1, TRUE),
('Qusyairi', 'qusyairi.zolkefle@mimos.my', 1, TRUE),
('Fuziah', 'fuziah.rahim@mimos.my', 1, TRUE),
('Adilah', 'adilah.nisman@mimos.my', 1, TRUE),
('Aisyah', 'aisyah.alias@mimos.my', 1, TRUE),
('Dr. Ahmad Nizar', 'nizar.harun@mimos.my', 3, TRUE),
('Farrah', 'farrah.johar@mimos.my', 1, TRUE),
('Sholihin', 'sholihin.abdullah@mimos.my', 1, TRUE),
('Dr. Afiq', 'muhammadafiq.azmi@mimos.my', 1, TRUE),
('Ainur Najwa', 'ainur.rodzi@mimos.my', 1, TRUE),
('Mohd Suhairi', 'suhairi.soobni@mimos.my', 1, TRUE),
('Omar', 'omar.azmi@mimos.my', 1, TRUE),
('Fatin Firzana', 'fatin.pata@mimos.my', 1, TRUE),
('Amalia Adriana', 'amalia.rizam@mimos.my', 1, TRUE),
('Nur Aleeya', 'aleeya.amran@mimos.my', 1, TRUE),
('Muhammad Yusuf', 'yusuf.zolkipli@mimos.my', 1, TRUE),
('Admin', 'saidrazak88@gmail.com', 2, TRUE);

-- Accounts
INSERT INTO account (code, name, description, account_type_id, is_active) VALUES
('MSSB', 'MIMOS Services Sdn Bhd', 'Primary operating subsidiary for MIMOS Academy', 1, TRUE),
('MB', 'MIMOS Berhad', 'Parent company entity', 2, TRUE),
('MIMOS', 'MIMOS Group', 'Generic MIMOS group billing', 3, TRUE),
('MH', 'MIMOS Holdings Sdn Bhd', 'Investment holding company', 4, TRUE);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SECTION 1
-- ============================================================
