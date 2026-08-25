# MIMOS Academy MySQL Database Script: Authoritative Design Synthesis

Merged panel findings to guide generation of the approved canonical schema

## Executive Summary
The panel converged on a programme-centric MySQL 8.0+ schema using InnoDB, utf8mb4, strict SQL mode, surrogate primary keys, and controlled lookup tables. This design transforms fragmented Excel workbooks into a single source of truth for quotations, invoices, payments, training statistics, opportunities, and action items. The schema must treat the programme as the central entity, with all transactional data hanging off it through stable foreign keys.

Financial fields must use exact DECIMAL types rather than FLOAT or DOUBLE. All canonical tables must carry audit and lineage columns so every row can be traced to its source file, row number, and import batch. Status values, payment methods, account entities, and other vocabularies must be normalised into reference tables rather than free text or MySQL ENUM, because source statuses are inconsistent across files.

A staging buffer is mandatory before data reaches canonical tables. Source files disagree on payment statuses, amounts, and identifiers; they contain placeholders such as 'Pending @ Fin', broken formula results such as #REF! and #DIV/0!, and multiple date formats. The panel disagreed on how strict unique constraints and financial checks should be, but agreed that the final script must support manual review queues and phased import rather than direct destructive loading.

- MySQL 8.0+ with InnoDB and utf8mb4 is the required target.
- Surrogate BIGINT UNSIGNED AUTO_INCREMENT primary keys on every canonical table.
- Money as DECIMAL, never FLOAT or DOUBLE.
- Lookup tables for statuses, account entities, payment methods, and other controlled vocabularies.
- Staging tables and manual review workflow before canonical commit.

## Evidence Base and Source Data Characteristics
The panel reviewed multiple source files: R1 MIMOS_Academy_INCOME_STATEMENT.xlsx, invoice_2026, Quotation Tracker, R2 Overall Report 2026, R3 Group 2026 Funnel Tracker, sales_report_2026-08-19, cost_of_sales_2026, office_funnel_2026-08-19, and User Profiles Mapping.xlsx. These files overlap heavily but are not linkable by any shared programme identifier. For example, R1 row 10 and row 12 both reference quotation MASB/QT/TRA/2026/0036rev2 for the same client and training dates, but they carry different invoice numbers and values: 95000251/2026 at 19,444.44 and 13000029/2026 at 26,800.00.

Source data contains inconsistent payment statuses. R1 row 18 shows MINDEF as PAID, while invoice_2026 row 18 shows the same apparent transaction as UNPAID. Financial values also conflict: R1 row 4 for invoice 95000063/2026 shows SST '-' and total 2,000.00, while invoice_2026 row 4 for the same invoice shows SST 160.00 and total 2,160.00. The files mix date formats such as 06-Jan-26, 1/6/26, 3/27/26, and 19/08/2026, 10:07:47 am.

Identifiers are unreliable. Invoice numbers include real values such as 95000016/2026 but also placeholders like Pending @ Fin, Pending @ Fin_1, Pending @ Fin_2, and Pending @ Fin_3. Quotation numbers appear in at least three formats: MSSB/QT/TRA/2026/0001, MASB/QT/TRA/2026/0001, and MA/QT/2026(0001). Staff names drift: Adilah appears as Adila, Solehin appears as both Solehin and solehin, and Abu Sa'id appears as Abu Said. R2 is a denormalised report with merged headers and formula errors such as #REF! and #DIV/0!.

- R1 and invoice_2026 are near-duplicate invoice sets that disagree on several rows.
- Placeholder invoice numbers and missing fields break natural-key uniqueness.
- Staff, client, account, and status vocabularies are free text and inconsistent.
- R2 is a wide report format that must be normalised before relational loading.

## Discipline Contributions: Systems Architect
A Systems Architect applying Expert Opinion recommended targeting MySQL 8.0+ with InnoDB, utf8mb4, and strict SQL mode. InnoDB is the only MySQL engine that enforces foreign keys and supports row-level locking for concurrent data entry. utf8mb4 is required for Malaysian names, apostrophes such as Abu Sa'id, and mixed client names. The Architect specified that business identity should be protected by composite unique keys while every canonical table uses a BIGINT UNSIGNED AUTO_INCREMENT surrogate primary key.

The Architect also recommended DECIMAL for all money fields, DATE for business dates, and DATETIME(6) for audit timestamps. DATETIME(6) avoids the 2038 limitation of TIMESTAMP and prevents timezone-session shifts. Statuses, types, and methods should use lookup tables rather than ENUM because source vocabularies are uncontrolled and need to evolve without ALTER TABLE.

In a separate Systems Thinking finding, the Architect reinforced the programme-centric model as the keystone. The proposed canonical table list includes account or legal entity, staff, client, programme, quotation, purchase_order, invoice, payment, training_stat, opportunity, action_item, import_batch, and staging tables. Foreign keys should use explicit indexes and RESTRICT deletion for parent rows, with SET NULL only for optional links.

- MySQL 8.0+ with InnoDB and utf8mb4_0900_ai_ci, falling back to utf8mb4_unicode_ci on MySQL 5.7.
- Surrogate BIGINT UNSIGNED AUTO_INCREMENT primary keys plus composite business keys.
- Money as DECIMAL, dates as DATE, audit timestamps as DATETIME(6).
- Foreign keys with RESTRICT on master data and explicit indexes.

## Discipline Contributions: Data Scientist
A Data Scientist applying Systems Thinking identified the programme as the system's central entity. Without a shared programme_id, every downstream join is fragile. The source files describe the same business event from different angles but no stable key links them. The scientist also insisted that raw Excel must enter a staging schema, not canonical tables directly, because files are reports rather than records of truth and contain contradictions such as MINDEF being both PAID and UNPAID for the same apparent transaction.

The same scientist recommended separating actuals, forecast/funnel, delivery, and task lifecycle states. Forecast and actual revenue measure different things and must not be stored in one table. Controlled vocabularies must be system-wide reference tables, not free text. Money fields must be normalised with tax amount separate from base amount, and column names must avoid spreadsheet-style labels such as 'Revenue (RM)'.

A second Data Scientist applying Design Thinking emphasised empathy with MASB users and iterative validation. The schema must be programme-centric but allow nullable foreign keys to programme for early quotations without delivery. All monetary columns should be DECIMAL(18,2), and every canonical table should carry lineage columns such as source_file, source_row_number, created_at, updated_at, and created_by. The MySQL script must be idempotent and ordered for foreign-key creation, with CHECK constraints enforcing financial and date invariants on MySQL 8.0.16+.

- Programme is the keystone entity; all invoices, quotations, payments, and training stats must link to it.
- Staging buffer with validation, deduplication, and conflict review is mandatory.
- Forecast and actual revenue must live in separate tables.
- Use DECIMAL(18,2) for monetary columns and include a currency column defaulting to MYR.

## Discipline Contributions: Software Developer
A Software Developer applying Design Thinking recommended basing tables on business lifecycle rather than spreadsheet files. The current overlapping Excel files cause drift, so the MySQL schema should model real-world events such as quotation, training delivery, invoice, and payment. The developer also recommended surrogate primary keys plus composite business keys because natural keys like quotation number are not unique and invoice number contains placeholders.

The developer insisted on DECIMAL for money, lookup tables for statuses, and master data tables for client, staff, and account with foreign keys. Staging tables and full audit fields are needed because source files are untrusted. Column naming should use consistent snake_case and avoid MySQL reserved words. Dates must be stored as DATE, not strings, because inconsistent date strings make reporting unreliable.

In a Root Cause Analysis finding, the developer noted that monetary values in Excel are stored as text with commas and spaces, requiring cleanup before inserting into DECIMAL. Quotation numbers contain revision suffixes and should not be unique. Missing values are encoded as display strings such as '-', 'No Data', and 'Pending @ Fin', which must be normalised to NULL. R2 is a report with merged headers and summary rows that needs a staging table with row_type and a mapping step before canonical insertion.

- Model business lifecycle events, not spreadsheet tabs.
- Use snake_case column names and avoid MySQL reserved words.
- Store business dates as DATE and audit timestamps as DATETIME or TIMESTAMP.
- Normalise placeholder strings to NULL before canonical insert.

## Discipline Contributions: Product Manager
A Product Manager applying Root Cause Analysis identified the missing stable programme identifier as the primary root cause of cross-file fragmentation. Enforcing a unique constraint on quotation number alone would incorrectly merge legitimate multiple-invoice programmes. The manager therefore recommended surrogate programme_id and a staging review queue for mapping from composite columns.

The Product Manager argued that payment should be derived from a transaction table rather than stored as free text on invoices. Conflicting payment statuses show that two manually maintained invoice datasets have drifted; the canonical schema needs a payment table with payment_date and amount, and invoice status should be audited or derived. The Account column conflates client, paying entity, and revenue-recognising entity, so a separate legal_entity or account table must be introduced.

The manager also noted that financial values are presented as formatted text and may contain formula artifacts. MySQL DECIMAL and DATE columns need validation before insert. Placeholder strings like 'Pending @ Fin' and 'Last Year Quo by Farrah' are not valid keys and should not be stored as canonical values. Staff names must be resolved to a canonical staff table before enforcing referential integrity, and R2 must be normalised into a long-format training_stat table keyed to programme_id.

- Missing programme_id is the root cause of fragmentation.
- Payment status should be derived from a payment table, not free text on invoices.
- Separate legal_entity from client to avoid financial reporting corruption.
- Use a canonical staff table with unique email as natural key.

## Discipline Contributions: QA Lead
A QA Lead applying Expert Opinion flagged that mirrored files disagree on SST and totals for the same invoice. The script should store explicit base_amount, sst_amount, and total_amount as DECIMAL and treat computed values as staging-only, rather than enforcing a strict equality that would hide conflicts. Payment status is contradictory across source systems, so a staging table with source_file, raw_status, and conflict_flag is needed.

The QA Lead confirmed that quotation_no cannot be unique because MASB/QT/TRA/2026/0036rev2 appears twice with different amounts. A composite business key or non-unique index on quotation number is safer. Staff names are not normalised and would break foreign keys if raw names are enforced, so a staff master keyed by email is required. Date formats are inconsistent and would fail MySQL DATE conversion; payment_date must be nullable because unpaid invoices legitimately have no date.

The QA Lead also found that R2 training statistics are a denormalized wide matrix with formula errors, and should be normalised into a training_stat table. Placeholder invoice numbers break uniqueness and completeness rules if invoice_no is declared UNIQUE NOT NULL. Finally, no shared programme ID exists across the source files, so the SQL must create the programme table first and a staging mapping table with review for near matches.

- Store source-reported base, SST, and total independently; do not compute one from the others during staging.
- Staging tables must carry source_file and raw_status to track conflicts.
- Payment_date must be nullable.
- No unique constraint on quotation_no alone.

## Points of Disagreement
The panel disagreed on how strict completeness should be. Some disciplines argued for hard NOT NULL constraints on critical business fields to force clean data, while others argued that real MASB workflows contain incomplete records and strict constraints would block partial imports. The emerging compromise is to allow NULL on business fields but expose gaps through a completeness engine, not through hard MySQL constraints.

Financial invariants were also contested. A Systems Architect proposed a CHECK constraint requiring total_incl_tax to equal amount_excl_tax plus sst_amount within 0.01 tolerance. However, the QA Lead and a Software Developer noted that source rows often round differently, such as 1842.59 base plus 147.4072 SST giving 1989.9972 total in one file while the equivalent row shows 147.41 SST and 1,990.00 total in another. The panel moved toward storing all three reported values and using tolerance checks only to flag anomalies.

Unique business-key strictness was another disagreement. Some recommended a simple UNIQUE constraint on invoice_no where not placeholder, while others preferred a composite unique key over client_id, programme_id, invoice_no, and invoice_date. The panel ultimately endorsed a functional unique index that ignores placeholder invoice numbers, plus a normal index on the composite natural key, with manual review for near matches.

- Strict NOT NULL constraints on business fields versus nullable fields plus completeness engine.
- Hard CHECK equality on financial totals versus storing source values independently with tolerance flags.
- Simple unique invoice_no versus composite business key uniqueness.
- All disciplines agree unresolved values must park in a review queue rather than hard-fail.

## Architecture Decision: Programme-Centric Canonical Model
The canonical schema must place programme at the centre. Programme is the stable business entity that spans quotation, training delivery, invoice, payment, and funnel stages. All other tables should reference programme_id through foreign keys. The Systems Architect and both Data Scientists independently converged on this structure because the source files describe the same programmes from different angles without a shared ID.

The proposed canonical table list includes account or legal_entity, staff, client, programme, quotation, purchase_order, invoice, payment, training_stat, opportunity, action_item, import_batch, and staging tables. Account or legal_entity must be separated from client because the source Account column contains values like MSSB, MB, and MIMOS that may represent revenue-recognising entity rather than the billed client. Staff must be a separate dimension table keyed by email to resolve name variants.

Foreign keys should be declared with explicit indexes. Parent rows in client, staff, account, and programme should not be deleted if children exist; use ON DELETE RESTRICT or NO ACTION. Optional links such as quotation_id or purchase_order_id on invoice may use ON DELETE SET NULL. This prevents accidental orphaned financial records while preserving the ability to null out optional links.

The training_stat table must be normalised as a fact table with programme_id, domain or category, workshop_count, training_count, total_count, and bumiputera status. This avoids replicating R2's wide merged-header format and allows new domains to be added without schema changes.

- programme is the hub; all transactional tables FK to programme.id.
- Separate legal_entity from client.
- staff table with unique email.
- training_stat normalised to long format.

## Data Types and Financial Integrity Standards
All money fields must use DECIMAL, never FLOAT or DOUBLE. The panel observed floating-point artifacts in source data, such as 1842.59 base and 147.4072 SST producing 1989.9972 total instead of a clean 1990.00. A Software Developer proposed DECIMAL(14,2) or DECIMAL(15,2); a Data Scientist recommended DECIMAL(18,2); the Systems Architect suggested DECIMAL(14,2) for accounting totals and DECIMAL(15,4) for unit prices and intermediate calculations. The synthesis selects DECIMAL(15,2) for most money, with DECIMAL(15,4) where source precision requires, and a currency column defaulting to MYR.

Invoice, quotation, purchase order, payment, and funnel amounts need base amount, SST amount, and total amount stored separately. The QA Lead and Data Scientist agreed the script should not derive total from rounded base plus SST because source totals often diverge from recalculated sums. Instead, store all three reported values and add tolerance-based validation in the staging layer.

Business dates must use DATE. Training start and end dates, invoice dates, due dates, and payment dates are calendar dates, while audit fields use DATETIME(6) with DEFAULT CURRENT_TIMESTAMP(6) and ON UPDATE CURRENT_TIMESTAMP(6). DATETIME(6) avoids timezone-session conversion and 2038 limitations. The panel also specified utf8mb4 for all tables to store Malaysian names and apostrophes.

CHECK constraints may be used on MySQL 8.0.16+ for non-negative amounts and training_end_date >= training_start_date. However, the panel cautioned that CHECK constraints are silently ignored on MySQL 5.7, so the script must state the minimum MySQL version and not rely solely on CHECK for data quality.

- Use DECIMAL(15,2) for monetary columns, with DECIMAL(15,4) where precision requires.
- Store base_amount, sst_amount, and total_amount independently.
- DATE for business dates; DATETIME(6) for audit timestamps.
- CHECK constraints only on MySQL 8.0.16+.

## Identity and Key Strategy
Every canonical table must use a surrogate BIGINT UNSIGNED NOT NULL AUTO_INCREMENT primary key. Business identity should be protected by separate composite unique keys or non-unique indexes over natural columns. This allows user-facing IDs to be edited later without breaking relationships. The Systems Architect and several other disciplines agreed on this strategy because natural keys such as quotation number and invoice number are not stable enough for primary keys.

Invoice numbers must not be constrained UNIQUE NOT NULL because source data contains placeholders like Pending @ Fin. The Systems Architect proposed a functional unique index in MySQL 8 that treats placeholder invoice numbers as NULL: a functional index on invoice_no where invoice_no NOT LIKE 'Pending @ Fin%'. A normal index on client_id, programme_id, invoice_no should also be created for lookups.

Quotation numbers also cannot be unique because MASB/QT/TRA/2026/0036rev2 appears with different invoices and amounts. The panel recommended a non-unique index on quotation_no and a composite business key for matching such as client_id plus programme_id plus invoice_no plus invoice_date, but with a review queue for near matches. Staff uniqueness should be on email from the User Profiles Mapping file, not on full name because of spelling variants.

For programme master building, the panel identified no reliable shared ID. The migration must create programme records by matching client plus title plus date ranges, and then link invoices, quotations, and training stats to the resulting programme_id. A staging mapping table should hold source natural keys and resolved programme_id to support idempotent re-imports.

- Surrogate BIGINT AUTO_INCREMENT PK on every canonical table.
- Functional unique index for real invoice numbers only.
- Non-unique index on quotation_no.
- Staff unique key is email, not full name.
- Programme mapping table holds source natural keys.

## Staging and Ingestion Workflow
Raw Excel must land in a staging schema before canonical tables. The panel unanimously identified staging as mandatory because source files are reports with contradictions, formula errors, and placeholders. Staging tables should carry raw source columns as VARCHAR where data is dirty, plus lineage columns such as source_file, source_row, import_batch_id, and validation_status.

The ingestion process must validate, deduplicate, and flag conflicts before commit. The QA Lead specified a staging table with source_file, raw_status, and conflict_flag. The Data Scientist warned that direct import would replicate contradictions rather than resolve them. A manual review queue is needed for rows that match inconsistently, such as MINDEF PAID vs UNPAID.

The final script must be idempotent. The Software Developer and Data Scientist both emphasised that safe re-runnability is more important than brevity for the MASB team. DDL should use CREATE TABLE IF NOT EXISTS conventions or migration-versioning, and parent tables must be created before child tables. Data loads should key on lineage and avoid duplicating already imported source rows.

- Staging schema receives all raw Excel data.
- Validation flags malformed dates, non-numeric money, and formula errors.
- Conflict review queue before canonical commit.
- Idempotent DDL and data load logic.

## Status and Reference Vocabulary Governance
Status, payment method, account entity, sector, training type, and staff role must use reference lookup tables, not free text nor MySQL ENUM. Source vocabularies are inconsistent: R3 uses 'Contract signed/PO issued', 'Verbal commitment', 'Qualified lead/Tender in progress'; office_funnel uses 'In Progress', 'Done', 'Pending'; payment statuses include 'PAID', 'UNPAID', and 'No Data'.

Lookup tables should have a short code, display label, and is_active flag. MySQL ENUM is simpler but adding a new status requires ALTER TABLE. The Product Manager and QA Lead preferred lookup tables for governance and flexibility. Account entities such as MSSB, MB, and MIMOS must be normalised into a legal_entity or account table to avoid conflating client and revenue entity.

During import, legacy free-text status labels must be mapped to canonical codes. Unmapped labels should be flagged for review and inserted into the reference table only after governance approval. This prevents invalid statuses from entering canonical records while still allowing future vocabulary growth.

- Use reference tables with code, label, and is_active.
- Map legacy labels to canonical codes during staging.
- Unmapped statuses park in review.
- Account/legal_entity reference table separate from client.

## Audit, Lineage, and Completeness
Every canonical table must carry audit and lineage columns. Recommended columns include source_system, source_file, source_row, import_batch_id, created_at, updated_at, created_by. The Systems Architect and Data Scientist both noted that office_funnel_2026-08-19 already tracks Created By, Created At, and Updated At, proving the pattern is feasible. Without lineage, future reconciliations become forensic guesswork.

Completeness should be tracked as a system feedback loop, not as hard NOT NULL constraints. A programme may validly exist before an invoice or training stats are ready. Blocking partial imports creates data-entry deadlock; allowing incomplete records without visibility hides gaps. The Data Scientist recommended a completeness status column or completeness engine that flags missing R1 and R2 components, while N/A is treated as satisfied.

The panel distinguished NULL as unknown from N/A as not applicable. Spreadsheet blanks, dashes, and placeholder strings should be normalised to NULL during staging, while genuine not-applicable values should be coded as N/A. This convention prevents ambiguity in dashboards and completeness reporting.

Source provenance must include import batch and row-level linkage. The QA Lead and Data Scientist agreed that conflicting rows such as MINDEF PAID vs UNPAID must be identifiable by source_file and source_row before canonicalisation.

- Audit columns on every canonical table: created_at, updated_at, created_by, source_file, source_row, import_batch_id.
- Completeness engine flags missing components rather than hard NOT NULL.
- NULL = unknown; string N/A = not applicable.
- Conflicting rows must remain traceable to source.

## Risks and Mitigations
Several risks threaten the integrity of the final MySQL script. The most serious risk is source-file conflicts: R1 and invoice_2026 disagree on payment statuses and SST amounts, and no shared programme ID exists. If the script imports directly from one file, it will bake a wrong truth into the canonical database. The mitigation is the staging workflow with manual conflict review and source-lineage tracking.

Placeholder invoice numbers and missing financial fields break uniqueness and completeness rules. Declaring invoice_no UNIQUE NOT NULL would reject rows with Pending @ Fin or cause collisions. The mitigation is a functional unique index that excludes placeholders and nullable business fields, plus a completeness dashboard to surface missing data.

Malformed financial text and date strings will fail DECIMAL and DATE conversions. Source cells contain commas, spaces, dashes, and multiple date formats. The staging layer must clean and validate these values before insert. Formula-created errors such as #REF! and #DIV/0! must be flagged and quarantined.

Staff name variants and free-text status will break foreign keys if enforced directly. The mitigation is a staff master keyed by email with alias mapping, and reference lookup tables for all statuses. Unresolved values park in a review queue rather than duplicate rows.

Finally, CHECK constraints and MySQL 8.0 collations may not work if the hosting environment is MySQL 5.7. The script must declare the minimum MySQL version, fall back to utf8mb4_unicode_ci where necessary, and implement application-level validation as backup.

- Risk: conflicting source rows → staging conflict review.
- Risk: placeholder keys → functional unique index and nullable fields.
- Risk: malformed text and dates → staged parsing and validation.
- Risk: staff/vocabulary drift → master data and lookup tables.
- Risk: MySQL version mismatch → minimum version declaration and collation fallback.

## Phased Recommendation
Phase 1 establishes environment and reference tables. Create the MySQL database with InnoDB, utf8mb4, and strict SQL mode. Create lookup tables for statuses, payment methods, account entities, and other controlled vocabularies. Create the audit metadata tables such as import_batch. This phase must ensure the MySQL version is 8.0+ or document fallback decisions.

Phase 2 creates master data and the central programme table. Create client, staff, legal_entity/account, and programme tables with surrogate keys and appropriate unique constraints. Load staff from User Profiles Mapping using email as the unique key. Build programme records from client plus title plus date-range matching, with a staging mapping table and review queue for near matches.

Phase 3 creates staging tables for each source file shape. Staging tables should mirror raw source columns as VARCHAR where dirty, plus source_file, source_row, import_batch_id, and validation_status. Load R1, invoice_2026, Quotation Tracker, R2, R3, sales_report, cost_of_sales, and office_funnel into their respective staging tables. Apply validation for dates, decimals, and formula errors.

Phase 4 canonicalises data with conflict review. Deduplicate and map staging rows to programme_id, client_id, staff_id, and legal_entity_id. Replace placeholder strings with NULL or review flags. For conflicting rows such as MINDEF PAID vs UNPAID, mark conflict_flag and park in manual review. Insert only reviewed rows into canonical invoice, payment, quotation, purchase_order, training_stat, opportunity, and action_item tables.

Phase 5 adds constraints and production controls. After canonical tables are populated, apply functional unique indexes, composite business keys, and tolerance-based financial checks. Enable completeness engine and audit dashboards. Document operational workflows for future source file ingestion and re-runs. The script should support idempotent re-execution and incremental imports keyed on import_batch_id.

- Phase 1: environment and reference tables.
- Phase 2: master data and programme table.
- Phase 3: staging tables and validation.
- Phase 4: canonicalisation with conflict review.
- Phase 5: constraints, indexes, and production controls.