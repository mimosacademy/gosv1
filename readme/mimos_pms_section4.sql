
-- ============================================================
-- MIMOS ACADEMY PROJECT MANAGEMENT SYSTEM (PMS)
-- PRODUCTION-READY MySQL 8.0+ SQL SCRIPT
-- SECTION 4: Views, Functions, and Stored Procedures
-- Target: Hostinger MySQL
-- ============================================================

USE mimos_pms;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. REPORTING VIEWS
-- ============================================================

-- 1.1 R1 Income Statement View
CREATE OR REPLACE VIEW v_r1_income_statement AS
SELECT
    i.id AS invoice_id,
    i.invoice_no,
    i.invoice_date,
    i.due_date,
    i.days_outstanding,
    p.id AS programme_id,
    p.programme_code,
    p.title AS programme_title,
    c.id AS client_id,
    c.company_name AS client_name,
    a.code AS account_code,
    a.name AS account_name,
    rt.code AS revenue_type_code,
    rt.name AS revenue_type_name,
    i.amount_excl_tax,
    i.sst_amount,
    i.sst_rate,
    i.total_incl_tax,
    i.amount_collected,
    i.amount_outstanding,
    ps.code AS payment_status_code,
    ps.name AS payment_status_name,
    i.payment_date,
    pm.code AS payment_method_code,
    pm.name AS payment_method_name,
    pt.code AS payment_terms_code,
    pt.name AS payment_terms_name,
    i.quotation_no_ref,
    i.po_no_ref,
    i.training_start_date,
    i.training_end_date,
    am.full_name AS account_manager,
    pic.full_name AS pic_name,
    i.is_placeholder,
    i.is_cancelled,
    i.source_file,
    i.source_row_number
FROM invoice i
LEFT JOIN programme p ON i.programme_id = p.id
LEFT JOIN client c ON i.client_id = c.id
LEFT JOIN account a ON i.account_id = a.id
LEFT JOIN revenue_type rt ON i.revenue_type_id = rt.id
LEFT JOIN payment_status ps ON i.payment_status_id = ps.id
LEFT JOIN payment_method pm ON i.payment_method_id = pm.id
LEFT JOIN payment_terms pt ON i.payment_terms_id = pt.id
LEFT JOIN staff am ON p.account_manager_id = am.id
LEFT JOIN staff pic ON p.pic_id = pic.id
WHERE i.is_cancelled = FALSE;

-- 1.2 R2 Training Statistics View
CREATE OR REPLACE VIEW v_r2_training_stats AS
SELECT
    p.id AS programme_id,
    p.programme_code,
    p.title AS programme_title,
    c.company_name AS client_name,
    tt.name AS training_type_name,
    pc.name AS programme_category_name,
    p.start_date,
    p.end_date,
    p.duration_days,
    p.no_of_pax,
    ts.training_date,
    ts.training_name,
    ts.company_name AS training_company,
    ts.training_category,
    ts.domain_code,
    ts.domain_name,
    ts.workshop_count,
    ts.training_count,
    ts.total_count,
    ts.bumiputera_count,
    ts.non_bumiputera_count,
    ts.total_charges_excl_tax,
    ts.sst_amount AS training_sst,
    ts.final_charges_incl_tax,
    p.total_revenue_excl_tax,
    p.total_sst_amount,
    p.total_revenue_incl_tax,
    p.total_collected,
    p.total_outstanding,
    ps.name AS programme_status_name,
    am.full_name AS account_manager,
    pic.full_name AS pic_name
FROM programme p
LEFT JOIN client c ON p.client_id = c.id
LEFT JOIN training_type tt ON p.training_type_id = tt.id
LEFT JOIN programme_category pc ON p.programme_category_id = pc.id
LEFT JOIN programme_status ps ON p.programme_status_id = ps.id
LEFT JOIN staff am ON p.account_manager_id = am.id
LEFT JOIN staff pic ON p.pic_id = pic.id
LEFT JOIN training_stat ts ON p.id = ts.programme_id;

-- 1.3 R3 Funnel Pipeline View
CREATE OR REPLACE VIEW v_r3_funnel_pipeline AS
SELECT
    o.id AS opportunity_id,
    o.opportunity_code,
    c.company_name AS client_name,
    o.project_title,
    o.project_description,
    o.opportunity_type,
    os.name AS opportunity_status,
    os.code AS opportunity_status_code,
    stm.name AS speed_to_market,
    stm.quarter,
    stm.year,
    s.name AS sector_name,
    o.forecast_value,
    o.probability_percentage,
    o.weighted_value,
    o.secured_value,
    o.currency,
    o.expected_close_date,
    o.actual_close_date,
    o.po_date,
    o.po_value,
    o.is_government,
    o.is_private,
    o.is_interco,
    o.remarks,
    o.sector_remarks,
    am.full_name AS account_manager,
    sm.full_name AS salesman,
    p.id AS programme_id,
    p.programme_code AS linked_programme,
    o.source_file,
    o.source_row_number
FROM opportunity o
LEFT JOIN client c ON o.client_id = c.id
LEFT JOIN opportunity_status os ON o.opportunity_status_id = os.id
LEFT JOIN speed_to_market stm ON o.speed_to_market_id = stm.id
LEFT JOIN sector s ON o.sector_id = s.id
LEFT JOIN staff am ON o.account_manager_id = am.id
LEFT JOIN staff sm ON o.salesman_id = sm.id
LEFT JOIN programme p ON o.programme_id = p.id;

-- 1.4 Programme Completeness Dashboard View
CREATE OR REPLACE VIEW v_programme_completeness AS
SELECT
    p.id AS programme_id,
    p.programme_code,
    p.title,
    c.company_name AS client_name,
    ps.name AS programme_status,
    cs.quotation_score,
    cs.po_score,
    cs.invoice_score,
    cs.payment_score,
    cs.delivery_score,
    cs.participant_score,
    cs.charges_score,
    cs.pic_score,
    cs.overall_score,
    cs.overall_status,
    cs.missing_components,
    cs.na_components,
    cs.evaluated_at,
    p.total_revenue_excl_tax,
    p.total_revenue_incl_tax,
    p.total_collected,
    p.total_outstanding,
    p.start_date,
    p.end_date,
    p.duration_days,
    p.no_of_pax,
    am.full_name AS account_manager,
    pic.full_name AS pic_name
FROM programme p
LEFT JOIN client c ON p.client_id = c.id
LEFT JOIN programme_status ps ON p.programme_status_id = ps.id
LEFT JOIN completeness_score cs ON p.id = cs.programme_id
LEFT JOIN staff am ON p.account_manager_id = am.id
LEFT JOIN staff pic ON p.pic_id = pic.id;

-- 1.5 Financial Dashboard View
CREATE OR REPLACE VIEW v_financial_dashboard AS
SELECT
    'REVENUE' AS metric_category,
    'Total Revenue (excl SST)' AS metric_name,
    COALESCE(SUM(amount_excl_tax), 0) AS metric_value,
    COUNT(*) AS record_count
FROM invoice
WHERE is_cancelled = FALSE AND is_placeholder = FALSE

UNION ALL

SELECT
    'REVENUE' AS metric_category,
    'Total Revenue (incl SST)' AS metric_name,
    COALESCE(SUM(total_incl_tax), 0) AS metric_value,
    COUNT(*) AS record_count
FROM invoice
WHERE is_cancelled = FALSE AND is_placeholder = FALSE

UNION ALL

SELECT
    'COLLECTION' AS metric_category,
    'Total Collected' AS metric_name,
    COALESCE(SUM(amount_collected), 0) AS metric_value,
    COUNT(*) AS record_count
FROM invoice
WHERE is_cancelled = FALSE AND is_placeholder = FALSE

UNION ALL

SELECT
    'COLLECTION' AS metric_category,
    'Total Outstanding' AS metric_name,
    COALESCE(SUM(amount_outstanding), 0) AS metric_value,
    COUNT(*) AS record_count
FROM invoice
WHERE is_cancelled = FALSE AND is_placeholder = FALSE

UNION ALL

SELECT
    'OVERDUE' AS metric_category,
    'Overdue Amount' AS metric_name,
    COALESCE(SUM(amount_outstanding), 0) AS metric_value,
    COUNT(*) AS record_count
FROM invoice
WHERE is_cancelled = FALSE AND is_placeholder = FALSE
AND payment_status_id = (SELECT id FROM payment_status WHERE code = 'UNPAID')
AND days_outstanding > 0

UNION ALL

SELECT
    'FUNNEL' AS metric_category,
    'Total Forecast Value' AS metric_name,
    COALESCE(SUM(forecast_value), 0) AS metric_value,
    COUNT(*) AS record_count
FROM opportunity

UNION ALL

SELECT
    'FUNNEL' AS metric_category,
    'Total Weighted Forecast' AS metric_name,
    COALESCE(SUM(weighted_value), 0) AS metric_value,
    COUNT(*) AS record_count
FROM opportunity

UNION ALL

SELECT
    'FUNNEL' AS metric_category,
    'Total Secured Value' AS metric_name,
    COALESCE(SUM(secured_value), 0) AS metric_value,
    COUNT(*) AS record_count
FROM opportunity
WHERE opportunity_status_id = (SELECT id FROM opportunity_status WHERE code = 'CONTRACT_SIGNED');

-- 1.6 Action Item Dashboard View
CREATE OR REPLACE VIEW v_action_item_dashboard AS
SELECT
    ai.id AS action_item_id,
    ai.action_item_code,
    c.company_name AS client_name,
    p.title AS programme_title,
    o.project_title AS opportunity_title,
    ai.service,
    ai.action_description,
    ai.person_in_charge,
    ai.person_email,
    ai.due_date,
    ai.completed_date,
    ai.aging_days,
    ai.priority,
    ais.name AS status_name,
    ais.code AS status_code,
    ai.potential_revenue,
    ai.currency,
    ai.notes,
    st.full_name AS assigned_to,
    ai.created_at,
    ai.updated_at
FROM action_item ai
LEFT JOIN client c ON ai.client_id = c.id
LEFT JOIN programme p ON ai.programme_id = p.id
LEFT JOIN opportunity o ON ai.opportunity_id = o.id
LEFT JOIN action_item_status ais ON ai.action_item_status_id = ais.id
LEFT JOIN staff st ON ai.assigned_to_id = st.id;

-- 1.7 Payment Collection View
CREATE OR REPLACE VIEW v_payment_collection AS
SELECT
    p.id AS payment_id,
    p.payment_reference,
    i.invoice_no,
    i.invoice_date,
    prog.id AS programme_id,
    prog.title AS programme_title,
    c.company_name AS client_name,
    p.payment_date,
    p.amount,
    p.sst_amount,
    p.total_amount,
    p.currency,
    p.amount_allocated,
    p.amount_unallocated,
    pm.name AS payment_method,
    ps.name AS payment_status,
    rb.full_name AS received_by,
    p.bank_reference,
    p.cheque_no,
    p.transaction_id,
    p.notes
FROM payment p
LEFT JOIN invoice i ON p.invoice_id = i.id
LEFT JOIN programme prog ON p.programme_id = prog.id
LEFT JOIN client c ON p.client_id = c.id
LEFT JOIN payment_method pm ON p.payment_method_id = pm.id
LEFT JOIN payment_status ps ON p.payment_status_id = ps.id
LEFT JOIN staff rb ON p.received_by_id = rb.id;

-- 1.8 Staff Performance View
CREATE OR REPLACE VIEW v_staff_performance AS
SELECT
    s.id AS staff_id,
    s.full_name,
    s.email,
    sr.name AS role_name,
    COUNT(DISTINCT p.id) AS programmes_managed,
    COUNT(DISTINCT q.id) AS quotations_prepared,
    COUNT(DISTINCT o.id) AS opportunities_owned,
    COUNT(DISTINCT ai.id) AS action_items_assigned,
    COALESCE(SUM(p.total_revenue_excl_tax), 0) AS total_revenue_managed,
    COALESCE(SUM(p.total_collected), 0) AS total_collected_managed
FROM staff s
LEFT JOIN staff_role sr ON s.role_id = sr.id
LEFT JOIN programme p ON s.id = p.account_manager_id
LEFT JOIN quotation q ON s.id = q.account_manager_id
LEFT JOIN opportunity o ON s.id = o.account_manager_id
LEFT JOIN action_item ai ON s.id = ai.assigned_to_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.full_name, s.email, sr.name;

-- ============================================================
-- 2. FUNCTIONS
-- ============================================================

DELIMITER //

-- 2.1 Calculate Days Outstanding
CREATE FUNCTION fn_days_outstanding(p_due_date DATE, p_payment_status_id BIGINT)
RETURNS INT
DETERMINISTIC
NO SQL
BEGIN
    DECLARE v_paid_id BIGINT;
    SELECT id INTO v_paid_id FROM payment_status WHERE code = 'PAID';

    IF p_due_date IS NULL OR p_payment_status_id = v_paid_id THEN
        RETURN NULL;
    END IF;

    RETURN DATEDIFF(CURDATE(), p_due_date);
END //

-- 2.2 Calculate Weighted Forecast
CREATE FUNCTION fn_weighted_forecast(p_forecast DECIMAL(15,2), p_probability DECIMAL(5,2))
RETURNS DECIMAL(15,2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_forecast IS NULL OR p_probability IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN p_forecast * (p_probability / 100);
END //

-- 2.3 Calculate SST Amount
CREATE FUNCTION fn_calc_sst(p_base_amount DECIMAL(15,2), p_sst_rate DECIMAL(5,4))
RETURNS DECIMAL(15,2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_base_amount IS NULL OR p_sst_rate IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(p_base_amount * p_sst_rate, 2);
END //

-- 2.4 Calculate Total Including SST
CREATE FUNCTION fn_calc_total_incl_sst(p_base_amount DECIMAL(15,2), p_sst_amount DECIMAL(15,2))
RETURNS DECIMAL(15,2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_base_amount IS NULL THEN
        RETURN NULL;
    END IF;
    IF p_sst_amount IS NULL THEN
        RETURN p_base_amount;
    END IF;
    RETURN p_base_amount + p_sst_amount;
END //

-- 2.5 Check Programme Completeness
CREATE FUNCTION fn_programme_completeness(p_programme_id BIGINT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_score INT DEFAULT 0;
    DECLARE v_total INT DEFAULT 8;

    -- Check quotation
    IF EXISTS (SELECT 1 FROM quotation WHERE programme_id = p_programme_id) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check PO
    IF EXISTS (SELECT 1 FROM purchase_order WHERE programme_id = p_programme_id) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check invoice
    IF EXISTS (SELECT 1 FROM invoice WHERE programme_id = p_programme_id AND is_placeholder = FALSE) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check payment
    IF EXISTS (SELECT 1 FROM payment WHERE programme_id = p_programme_id) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check delivery (programme status delivered or completed)
    IF EXISTS (SELECT 1 FROM programme p 
               JOIN programme_status ps ON p.programme_status_id = ps.id 
               WHERE p.id = p_programme_id AND ps.code IN ('DELIVERED', 'COMPLETED')) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check participants
    IF EXISTS (SELECT 1 FROM training_stat WHERE programme_id = p_programme_id) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check charges
    IF EXISTS (SELECT 1 FROM invoice WHERE programme_id = p_programme_id AND amount_excl_tax > 0) THEN
        SET v_score = v_score + 1;
    END IF;

    -- Check PIC
    IF EXISTS (SELECT 1 FROM programme WHERE id = p_programme_id AND pic_id IS NOT NULL) THEN
        SET v_score = v_score + 1;
    END IF;

    RETURN ROUND((v_score / v_total) * 100);
END //

-- 2.6 Get Programme Financial Summary
CREATE FUNCTION fn_programme_financial_summary(p_programme_id BIGINT)
RETURNS JSON
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_result JSON;

    SELECT JSON_OBJECT(
        'total_invoices', COUNT(*),
        'total_revenue_excl_tax', COALESCE(SUM(amount_excl_tax), 0),
        'total_sst', COALESCE(SUM(sst_amount), 0),
        'total_revenue_incl_tax', COALESCE(SUM(total_incl_tax), 0),
        'total_collected', COALESCE(SUM(amount_collected), 0),
        'total_outstanding', COALESCE(SUM(amount_outstanding), 0),
        'paid_count', SUM(CASE WHEN payment_status_id = (SELECT id FROM payment_status WHERE code = 'PAID') THEN 1 ELSE 0 END),
        'unpaid_count', SUM(CASE WHEN payment_status_id = (SELECT id FROM payment_status WHERE code = 'UNPAID') THEN 1 ELSE 0 END),
        'overdue_count', SUM(CASE WHEN payment_status_id = (SELECT id FROM payment_status WHERE code = 'UNPAID') AND days_outstanding > 0 THEN 1 ELSE 0 END)
    ) INTO v_result
    FROM invoice
    WHERE programme_id = p_programme_id AND is_cancelled = FALSE AND is_placeholder = FALSE;

    RETURN v_result;
END //

DELIMITER ;

-- ============================================================
-- 3. STORED PROCEDURES
-- ============================================================

DELIMITER //

-- 3.1 Refresh Programme Financials
CREATE PROCEDURE sp_refresh_programme_financials(IN p_programme_id BIGINT)
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
        ),
        total_collected = (
            SELECT COALESCE(SUM(py.amount), 0)
            FROM payment py
            WHERE py.programme_id = p.id
            AND py.payment_status_id = (SELECT id FROM payment_status WHERE code = 'PAID')
        )
    WHERE p.id = p_programme_id;
END //

-- 3.2 Refresh All Programme Financials
CREATE PROCEDURE sp_refresh_all_programme_financials()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_programme_id BIGINT;
    DECLARE cur CURSOR FOR SELECT id FROM programme WHERE is_active = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_programme_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        CALL sp_refresh_programme_financials(v_programme_id);
    END LOOP;
    CLOSE cur;
END //

-- 3.3 Evaluate Programme Completeness
CREATE PROCEDURE sp_evaluate_completeness(IN p_programme_id BIGINT)
BEGIN
    DECLARE v_quotation_score INT DEFAULT 0;
    DECLARE v_po_score INT DEFAULT 0;
    DECLARE v_invoice_score INT DEFAULT 0;
    DECLARE v_payment_score INT DEFAULT 0;
    DECLARE v_delivery_score INT DEFAULT 0;
    DECLARE v_participant_score INT DEFAULT 0;
    DECLARE v_charges_score INT DEFAULT 0;
    DECLARE v_pic_score INT DEFAULT 0;
    DECLARE v_overall_score INT;
    DECLARE v_overall_status VARCHAR(20);
    DECLARE v_missing JSON;
    DECLARE v_na JSON;

    -- Evaluate each component
    SET v_quotation_score = CASE WHEN EXISTS (SELECT 1 FROM quotation WHERE programme_id = p_programme_id) THEN 100 ELSE 0 END;
    SET v_po_score = CASE WHEN EXISTS (SELECT 1 FROM purchase_order WHERE programme_id = p_programme_id) THEN 100 ELSE 0 END;
    SET v_invoice_score = CASE WHEN EXISTS (SELECT 1 FROM invoice WHERE programme_id = p_programme_id AND is_placeholder = FALSE) THEN 100 ELSE 0 END;
    SET v_payment_score = CASE WHEN EXISTS (SELECT 1 FROM payment WHERE programme_id = p_programme_id) THEN 100 ELSE 0 END;
    SET v_delivery_score = CASE WHEN EXISTS (SELECT 1 FROM programme p JOIN programme_status ps ON p.programme_status_id = ps.id WHERE p.id = p_programme_id AND ps.code IN ('DELIVERED', 'COMPLETED')) THEN 100 ELSE 0 END;
    SET v_participant_score = CASE WHEN EXISTS (SELECT 1 FROM training_stat WHERE programme_id = p_programme_id) THEN 100 ELSE 0 END;
    SET v_charges_score = CASE WHEN EXISTS (SELECT 1 FROM invoice WHERE programme_id = p_programme_id AND amount_excl_tax > 0) THEN 100 ELSE 0 END;
    SET v_pic_score = CASE WHEN EXISTS (SELECT 1 FROM programme WHERE id = p_programme_id AND pic_id IS NOT NULL) THEN 100 ELSE 0 END;

    SET v_overall_score = ROUND((v_quotation_score + v_po_score + v_invoice_score + v_payment_score + v_delivery_score + v_participant_score + v_charges_score + v_pic_score) / 8);

    SET v_overall_status = CASE 
        WHEN v_overall_score = 100 THEN 'COMPLETE'
        WHEN v_overall_score >= 75 THEN 'NEARLY_COMPLETE'
        WHEN v_overall_score >= 50 THEN 'PARTIAL'
        WHEN v_overall_score >= 25 THEN 'INCOMPLETE'
        ELSE 'CRITICAL'
    END;

    -- Build missing components JSON
    SET v_missing = JSON_ARRAY();
    IF v_quotation_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'quotation'); END IF;
    IF v_po_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'purchase_order'); END IF;
    IF v_invoice_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'invoice'); END IF;
    IF v_payment_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'payment'); END IF;
    IF v_delivery_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'delivery'); END IF;
    IF v_participant_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'participant'); END IF;
    IF v_charges_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'charges'); END IF;
    IF v_pic_score = 0 THEN SET v_missing = JSON_ARRAY_APPEND(v_missing, '$', 'pic'); END IF;

    SET v_na = JSON_ARRAY();

    -- Insert or update completeness score
    INSERT INTO completeness_score (
        programme_id, quotation_score, po_score, invoice_score, payment_score,
        delivery_score, participant_score, charges_score, pic_score,
        overall_score, overall_status, missing_components, na_components
    ) VALUES (
        p_programme_id, v_quotation_score, v_po_score, v_invoice_score, v_payment_score,
        v_delivery_score, v_participant_score, v_charges_score, v_pic_score,
        v_overall_score, v_overall_status, v_missing, v_na
    )
    ON DUPLICATE KEY UPDATE
        quotation_score = v_quotation_score,
        po_score = v_po_score,
        invoice_score = v_invoice_score,
        payment_score = v_payment_score,
        delivery_score = v_delivery_score,
        participant_score = v_participant_score,
        charges_score = v_charges_score,
        pic_score = v_pic_score,
        overall_score = v_overall_score,
        overall_status = v_overall_status,
        missing_components = v_missing,
        na_components = v_na,
        evaluated_at = CURRENT_TIMESTAMP(6);
END //

-- 3.4 Evaluate All Programmes Completeness
CREATE PROCEDURE sp_evaluate_all_completeness()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_programme_id BIGINT;
    DECLARE cur CURSOR FOR SELECT id FROM programme WHERE is_active = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_programme_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        CALL sp_evaluate_completeness(v_programme_id);
    END LOOP;
    CLOSE cur;
END //

-- 3.5 Get Overdue Invoices Report
CREATE PROCEDURE sp_get_overdue_invoices(IN p_days_threshold INT)
BEGIN
    SELECT
        i.invoice_no,
        i.invoice_date,
        i.due_date,
        i.days_outstanding,
        i.amount_excl_tax,
        i.total_incl_tax,
        i.amount_outstanding,
        c.company_name AS client_name,
        p.title AS programme_title,
        ps.name AS payment_status,
        am.full_name AS account_manager
    FROM invoice i
    JOIN client c ON i.client_id = c.id
    JOIN programme p ON i.programme_id = p.id
    JOIN payment_status ps ON i.payment_status_id = ps.id
    LEFT JOIN staff am ON p.account_manager_id = am.id
    WHERE i.is_cancelled = FALSE
    AND i.is_placeholder = FALSE
    AND i.payment_status_id = (SELECT id FROM payment_status WHERE code = 'UNPAID')
    AND i.days_outstanding > p_days_threshold
    ORDER BY i.days_outstanding DESC;
END //

-- 3.6 Get Pipeline by Salesman
CREATE PROCEDURE sp_get_pipeline_by_salesman(IN p_salesman_id BIGINT)
BEGIN
    SELECT
        o.opportunity_code,
        c.company_name AS client_name,
        o.project_title,
        o.forecast_value,
        o.probability_percentage,
        o.weighted_value,
        os.name AS status_name,
        stm.name AS speed_to_market,
        o.expected_close_date
    FROM opportunity o
    JOIN client c ON o.client_id = c.id
    JOIN opportunity_status os ON o.opportunity_status_id = os.id
    LEFT JOIN speed_to_market stm ON o.speed_to_market_id = stm.id
    WHERE o.salesman_id = p_salesman_id
    AND os.code NOT IN ('LOST', 'WON')
    ORDER BY o.weighted_value DESC;
END //

-- 3.7 Import Staging to Canonical - Invoice
CREATE PROCEDURE sp_import_stg_invoice(IN p_batch_id BIGINT)
BEGIN
    DECLARE v_imported INT DEFAULT 0;
    DECLARE v_failed INT DEFAULT 0;

    -- Update batch status
    UPDATE import_batch SET status = 'PROCESSING', start_time = CURRENT_TIMESTAMP(6) WHERE id = p_batch_id;

    -- Process validated staging records
    START TRANSACTION;

    -- Insert logic would go here with proper mapping
    -- This is a template for the import workflow

    UPDATE import_batch 
    SET status = 'COMPLETED', 
        end_time = CURRENT_TIMESTAMP(6),
        records_inserted = v_imported,
        records_failed = v_failed
    WHERE id = p_batch_id;

    COMMIT;
END //

-- 3.8 Generate R1 Export
CREATE PROCEDURE sp_export_r1()
BEGIN
    SELECT * FROM v_r1_income_statement;
END //

-- 3.9 Generate R2 Export
CREATE PROCEDURE sp_export_r2()
BEGIN
    SELECT * FROM v_r2_training_stats;
END //

-- 3.10 Generate R3 Export
CREATE PROCEDURE sp_export_r3()
BEGIN
    SELECT * FROM v_r3_funnel_pipeline;
END //

DELIMITER ;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SECTION 4
-- ============================================================
