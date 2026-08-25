# Authoritative Database Schema Deliverable for MIMOS Academy PMS

Merged Panel Findings on the Project Management System Database Design

## Executive Summary
The MIMOS Academy Project Management System (PMS) database design has benefited from multiple disciplinary perspectives: Systems Architect, Data Scientist, Software Developer, Product Manager, and Quality Assurance Lead. Each panelist contributed executable MySQL schema fragments or design guidance covering master data, controlled vocabularies, transactional tables, and import lineage. The merged deliverable presents a consolidated, authoritative target schema that preserves the strengths of each contribution while resolving naming and structural disagreements.

The proposed design uses InnoDB storage, utf8mb4 character encoding, strict SQL modes, and explicit foreign key constraints. It includes lookup tables for statuses, payment methods, sectors, training types, and quotation types; master tables for account, staff, client, and programme; transactional tables for quotation, purchase order, payment, and invoice; and audit tables for source files and import batches. Data lineage is captured via source_file, source_row_number, and import_batch_id fields on master and transactional tables.

Adoption is recommended in six phases: establish conventions, implement lookups, build master data, add transactional tables, integrate import lineage, and complete seed data and testing. This approach reduces rework, ensures referential integrity, and provides a traceable path from source spreadsheets to relational records.

- Consolidates architecture, data science, development, product, and QA perspectives
- Uses InnoDB, utf8mb4, strict SQL modes, and foreign keys
- Captures source file and row number for data lineage
- Recommends phased implementation to reduce risk

## Evidence Base
The panel findings consist of multiple SQL schema drafts and design statements from five disciplines, each addressing the same PMS domain but with different naming, normalization, and audit choices. The Systems Architect (Expert Opinion) provided a normalized core with unique business keys. The Data Scientist (Systems Thinking) emphasized drop-and-recreate scripts, foreign key checks, and full lineage fields. The Software Developer (Design Thinking) supplied seed data for statuses and staff. The Product Manager (Root Cause Analysis) expanded status vocabularies and added speed-to-market categories. The Quality Assurance Lead (Expert Opinion) reinforced audit timestamps, import batch identifiers, and unique constraints.

External sources referenced by the panel include SQL compilers and tutorials, which informed executable MySQL syntax and online validation practices. These sources confirm the importance of engine, charset, collation, and foreign key settings in a MySQL 8.0+ environment. No external industry-specific benchmarks or quantitative performance figures were provided, so the merged deliverable relies solely on the disciplinary panel findings.

- Panel findings were produced by Systems Architect, Data Scientist, Software Developer, Product Manager, and Quality Assurance Lead
- SQL compilers and tutorials informed MySQL syntax and validation practices
- No quantitative performance figures were introduced from outside sources

## Systems Architect Contributions
The Systems Architect (Expert Opinion) proposed a foundational schema with account, staff, client, status, payment_method, program_type, quotation_type, sector, import_batch, programme, and quotation tables. This design emphasized InnoDB, utf8mb4_unicode_ci, DATETIME(6) audit timestamps, and unique constraints on business keys such as account code, client name, and quotation number. Foreign keys were applied from programme and quotation to their related master data, with ON DELETE SET NULL and ON UPDATE CASCADE.

The Systems Architect (Systems Thinking) later refined the model using reference tables with the ref_ prefix for lookups, including payment_method, payment_status, training_type, opportunity_status, task_status, sector, quotation_type, quotation_status, and project_status. This version separated reference data from transactional tables and included source_file and source_row columns on programme, quotation, and purchase order to preserve import lineage.

Both architect contributions agree on the need for normalized lookup tables, explicit foreign keys, and audit timestamps. Their main difference lies in prefix conventions and the choice between a generic status table with categories versus separate status lookup tables. The merged design adopts separate status tables but standardizes naming without the ref_ prefix.

- InnoDB, utf8mb4, DATETIME(6) audit timestamps, and unique business keys
- Reference tables for payment, status, sector, and training type
- Source file and row tracking on transactional tables
- Disagreement over generic status vs separate status tables and ref_ prefix

## Data Scientist Contributions
The Data Scientist (Systems Thinking) provided a drop-and-recreate schema that disabled foreign key checks during teardown, then rebuilt lookup tables for account_entity, sector, payment_status, payment_method, revenue_type, quotation_status, project_status, opportunity_status, and task_status. This design placed source_file and source_row_number on staff, client, and programme, and created an import_batch table with foreign key to staff for the importer.

The Data Scientist (Design Thinking) simplified the set of lookup tables and used table-specific primary keys such as staff_id, client_id, and programme_id. This version retained source_file, source_row_number, and import_batch_id on programme and client, and included foreign keys from client to sector and from programme to training_type, client, and account. Both Data Scientist contributions emphasize lineage and controlled vocabularies as first-class concerns.

A consistent theme from the Data Scientist panel is that source data quality cannot be separated from the schema. Fields such as source_file, source_row_number, and import_batch_id allow analysts to trace any record back to the original spreadsheet row, which is essential for reconciliation and error correction.

- Drop-and-recreate scripts with foreign key checks disabled during teardown
- Lookup tables for statuses, payment methods, sectors, and revenue types
- Source lineage fields on staff, client, programme, and quotation
- Import batch table supports importer attribution and audit

## Software Developer Contributions
The Software Developer (Design Thinking) contributed a practical schema with initial seed data for account_entity, sector_lookup, revenue_category, payment_method, payment_status, quotation_status, project_status, opportunity_status, and action_item_status. It also inserted staff records and defined action_item, opportunity, training_stat, payment, invoice, purchase_order, quotation, programme, client, and staff tables. Lookup tables used entity-specific IDs such as payment_method_id and quotation_status_id.

The Software Developer (Root Cause Analysis) introduced a source_file table with a file hash and a separate import_batch tied to source_file. This design added payment_terms, category, staff_role, and account_type as distinct lookup tables. It also included source_file_id and source_row_number on programme, and used full_name for staff. The developer perspective prioritizes executable migration order and reusable audit tables.

Both developer contributions provide ready-to-run seed data and emphasize an import workflow that begins with source_file and import_batch before populating master and transactional tables. This supports a root cause analysis path for any data issue discovered in reporting.

- Seed data for statuses, payment methods, sectors, staff, and action items
- source_file table with hash and import_batch table for import runs
- Lookup tables for payment_terms, category, staff_role, and account_type
- Executable migration order with foreign key dependencies

## Product Manager Contributions
The Product Manager (Root Cause Analysis) contributed a wide array of lookup tables including account, payment_method, payment_status, sector, quotation_type, training_type, programme_category, programme_status, funnel_status, speed_to_market, and action_status. This schema captured business process state transitions and speed-to-market categories, which are important for pipeline reporting and root cause analysis of delayed programmes.

This perspective also introduced import_batch with imported_by and notes, and master tables staff and client with source_file, source_row_number, and import_batch_id. The Product Manager root cause analysis focus ensures that status vocabularies are granular enough to support funnel analysis and that every record can be traced to its import source.

A key contribution is the separation of programme_status from project_status, quotation_status, and opportunity_status. This avoids overloading a single status field and allows the product team to report accurately on programme delivery, quotation pipeline, and opportunity funnel.

- Separate status tables for programme, project, quotation, opportunity, funnel, and action
- Speed-to-market categories support pipeline analysis
- Import batch with imported_by and notes for traceability
- Root cause analysis focus on process status granularity

## Quality Assurance Contributions
The Quality Assurance Lead (Expert Opinion) provided a highly normalized schema with import_batch, staff_role, sector, training_type, payment_method, payment_status, quotation_status, programme_status, opportunity_status, action_status, service_type, account, staff, client, and programme tables. This design used utf8mb4_0900_ai_ci, DATETIME(6) timestamps, and included source_file, source_row_number, and import_batch_id on master tables.

The QA contribution emphasized unique constraints on natural keys such as account code, account name, staff email, staff number, and client name. It also added role_id to staff and introduced service_type as a distinct lookup. The QA lead recommended capturing Bumiputera participation fields on programme and using DECIMAL for all monetary values.

From a QA perspective, the schema must support auditability at every stage: who imported the data, from which file, and with what outcome. The inclusion of import_batch_id on account, staff, client, and programme provides this traceability and aligns with data quality verification requirements.

- utf8mb4_0900_ai_ci collation and DATETIME(6) audit timestamps
- Unique constraints on account, staff email, staff number, and client name
- Import batch IDs on all master tables for lineage and audit
- DECIMAL monetary fields and explicit programme participation counts

## Points of Disagreement
The panel disagreed on primary key naming. The Systems Architect (Expert Opinion) and Quality Assurance Lead used id, while the Data Scientist (Design Thinking) and Software Developer (Design Thinking) used entity-specific names such as staff_id, client_id, and programme_id. The Systems Architect (Systems Thinking) used ref_ prefixes for lookups, while the Product Manager used full descriptive names such as programme_status_id. The merged design resolves this by using id for the primary key of each table and <entity>_id for foreign keys, which is explicit, consistent, and avoids prefix proliferation.

There was also disagreement over collation and time zone. One architect specified utf8mb4_unicode_ci and +00:00, while the QA Lead and the Systems Architect (Systems Thinking) used utf8mb4_0900_ai_ci, and the QA Lead used +08:00. The merged design recommends utf8mb4_0900_ai_ci for MySQL 8.0+ and storing all business timestamps as DATETIME(6) with an explicitly documented application time zone.

A third disagreement concerned the placement of payment status. Some panelists placed payment_status_id directly on quotation, while others modeled payment and invoice as separate transactional tables with their own status. The merged design supports both: quotation may carry a project or quotation status, but payment status belongs on the payment and invoice tables to avoid conflating quotation stage with settlement.

Finally, the panel differed on whether source_file should be a string column on each master table or a separate source_file table. The Software Developer (Root Cause Analysis) introduced a source_file table with a hash, while others used source_file VARCHAR columns. The merged recommendation adopts a source_file table referenced by import_batch, with source_file and source_row_number retained on transactional tables for direct lineage.

- Primary key naming: id vs entity-specific IDs vs ref_ prefixes
- Collation: utf8mb4_unicode_ci vs utf8mb4_0900_ai_ci and time zone +00:00 vs +08:00
- Payment status on quotation vs separate payment and invoice tables
- Source file as string vs separate source_file table

## Risks and Mitigations
A major risk is inconsistent naming causing maintenance confusion and broken foreign keys across development teams. The mitigation is to adopt the merged naming convention immediately and document it as part of the schema standard. Another risk is collation mismatch between tables, which can lead to unexpected uniqueness behavior. The mitigation is to enforce utf8mb4_0900_ai_ci consistently for all new tables and convert any legacy tables.

Referential integrity may be overlooked if foreign key checks are disabled during script execution. The mitigation is to disable foreign key checks only during teardown, then re-enable them before rebuilding tables, and to include FK constraints in the final schema. Seed data drift is another risk: if seed values are not version controlled, different environments may disagree. The mitigation is to store seed data in versioned migration files and treat them as schema artifacts.

Source lineage can be lost if source_file and source_row_number are not populated during import. The mitigation is to make these fields mandatory for all imported data and to validate that every record in programme, quotation, and related tables has a non-null import_batch_id where applicable. Time zone ambiguity can cause incorrect audit timestamps. The mitigation is to document and apply a consistent time zone setting, preferably +08:00 for MIMOS Academy operations.

- Inconsistent naming: standardize before table creation
- Collation mismatch: enforce utf8mb4_0900_ai_ci
- Referential integrity: re-enable FK checks after teardown
- Seed data drift: version control all seed data
- Lost lineage: require import_batch_id and source row fields
- Time zone ambiguity: adopt +08:00 and document it

## Recommended Conventions
The authoritative schema should use MySQL 8.0+ with InnoDB, utf8mb4_0900_ai_ci, and strict SQL modes. Table names should be singular and lowercase, with the primary key named id in each table. Foreign keys should use <entity>_id (for example, client_id, staff_id, programme_id) to remain unambiguous in joins and constraints.

All monetary values must be DECIMAL, business dates must be DATE, and audit timestamps must be DATETIME(6). Natural keys such as staff email, account code, client name, quotation number, and payment method code require unique constraints. Imported data must carry source_file, source_row_number, and import_batch_id where applicable.

Lookup tables should be named descriptively and without ref_ prefixes. Examples include payment_method, payment_status, sector, training_type, quotation_type, quotation_status, project_status, programme_status, opportunity_status, action_status, and payment_terms. These tables should include code and name columns, with code as the unique business key.

- MySQL 8.0+, InnoDB, utf8mb4_0900_ai_ci, strict SQL mode
- Primary key id, foreign keys <entity>_id
- DECIMAL for money, DATE for business dates, DATETIME(6) for audit
- Unique constraints on natural business keys
- Lookup tables with code and name, code unique

## Core Data Model Scope
The core tables include source_file, import_batch, staff_role, account, staff, sector, training_type, payment_method, payment_status, quotation_type, quotation_status, project_status, programme_status, opportunity_status, action_status, payment_terms, client, programme, quotation, purchase_order, payment, invoice, and action_item. This scope supports the full lifecycle from opportunity and quotation through programme delivery, purchase order, payment, and action tracking.

Staff and client tables are master data with natural keys on email and company name, respectively. Programme links client, training_type, account, account_manager, pic, and programme_status. Quotation links programme, client, quotation_type, training_type, account_manager, and status tables. Purchase order, payment, and invoice reference quotation and programme to maintain financial traceability.

The import_batch and source_file tables provide an audit trail for all imported data. Import_batch records the source file, importer, start and finish times, and status. Transactional tables such as programme, quotation, and payment retain source_file and source_row_number, allowing row-level reconciliation with the original spreadsheets.

- Lookups: payment_method, payment_status, sector, training_type, quotation_type, statuses
- Master: account, staff, client, programme
- Transactions: quotation, purchase_order, payment, invoice, action_item
- Audit: source_file and import_batch

## Import and Lineage
All panelists recognized the importance of import lineage. The Data Scientist (Systems Thinking) and Software Developer (Root Cause Analysis) both advocated a dedicated import_batch table. The Software Developer further added a source_file table with a file hash, which prevents duplicate imports and provides file-level integrity.

In the merged schema, source_file stores the file name and SHA-256 hash of each uploaded spreadsheet. import_batch references source_file and records the import status, start time, finish time, and importer. Master and transactional tables carry import_batch_id to group records by import run.

Row-level lineage is preserved through source_file and source_row_number columns on transactional tables. This allows any row in programme, quotation, purchase order, or payment to be traced back to the exact spreadsheet row from which it was loaded, enabling accurate root cause analysis and data correction.

- source_file table with file name and hash
- import_batch table records import run status and importer
- import_batch_id on master and transactional tables
- source_file and source_row_number on transactional tables for row-level traceability

## Status and Vocabulary Management
The Product Manager (Root Cause Analysis) and Software Developer (Design Thinking) contributed seed data for status vocabularies. These include payment statuses such as PAID, UNPAID, PENDING, and UNKNOWN; quotation statuses such as Sent, In Progress, Accepted, and Rejected; project statuses such as DONE, FOLLOW UP, In Progress, Pending, and Closed; and opportunity statuses covering early engagement, negotiation, proposal submission, contract signed, and lost.

The merged design keeps these statuses in separate lookup tables rather than a single generic status table with categories. This simplifies foreign key relationships and prevents status codes from one process being applied incorrectly to another. Each status table includes a code and name, with code as the unique business key.

Action item statuses and programme statuses are also separate. Programme status may differ from project status because a programme can span multiple projects or quotations. This separation allows the product team to report accurately on delivery status without confusing pipeline stage or payment status.

- Separate lookup tables for payment, quotation, project, programme, opportunity, and action statuses
- Seed data provided by Software Developer and Product Manager
- Code and name columns with unique code
- Avoids conflation between process stages

## Phased Recommendation
Phase 1: Standardize Conventions. Adopt the merged naming, collation, engine, and audit timestamp standards. Create a schema dictionary documenting id primary keys, <entity>_id foreign keys, DECIMAL money fields, DATE business dates, and DATETIME(6) audit fields. This phase should be completed before any table creation.

Phase 2: Build Lookup Tables. Implement source_file, import_batch, staff_role, account_type, sector, training_type, payment_method, payment_status, quotation_type, quotation_status, project_status, programme_status, opportunity_status, action_status, and payment_terms. Load seed data from the Software Developer (Design Thinking) contribution, adjusted to the final naming conventions.

Phase 3: Build Master Data Tables. Create staff, account, client, and programme with full foreign key constraints to lookup tables and natural unique keys. Include source_file, source_row_number, and import_batch_id where applicable. Populate staff and account from seed data or controlled imports.

Phase 4: Build Transactional Tables. Create quotation, purchase_order, payment, invoice, and action_item with foreign keys to master and lookup tables. Preserve money fields as DECIMAL and dates as DATE. Ensure quotation_no has a unique constraint and that purchase_order and payment reference both quotation and programme as needed.

Phase 5: Integrate Import Lineage. Finalize the import workflow so that source_file and import_batch are populated before any master or transactional data. Require row-level source_file and source_row_number on all imported transactional tables. Validate that import_batch_id is not null where lineage is required.

Phase 6: Testing and Audit. Execute the full migration in a staging environment, verify foreign key constraints, test import of representative source data, and reconcile row counts with source files. Document a data dictionary and seed data migration plan. After QA sign-off, deploy to production using the same versioned migration scripts.

- Phase 1: Standardize conventions and document schema dictionary
- Phase 2: Build lookup tables and load seed data
- Phase 3: Build master data tables with unique keys and FK constraints
- Phase 4: Build transactional tables with DECIMAL money fields
- Phase 5: Integrate source_file and import_batch lineage
- Phase 6: Test, audit, and deploy with versioned migrations

## Conclusion
The merged deliverable for MIMOS Academy PMS combines the strongest elements of the Systems Architect, Data Scientist, Software Developer, Product Manager, and Quality Assurance Lead contributions. It establishes a normalized, auditable, and import-friendly database schema that can support the full lifecycle from opportunity to payment.

By resolving the points of disagreement through explicit conventions, the organization gains a maintainable schema with clear naming, consistent collation, robust referential integrity, and complete source lineage. The phased recommendation reduces delivery risk and ensures that each component is tested before the next is built.

This authoritative deliverable should be treated as the baseline for all subsequent database development. Any future changes should be reviewed against the documented conventions and the import lineage requirements to preserve the audit and reconciliation capabilities that the panel collectively identified as essential.

- Consolidates all disciplinary contributions into a single target schema
- Resolves naming, collation, and lineage disagreements
- Supports full lifecycle from opportunity to payment
- Provides phased implementation to reduce risk