# MIMOS Academy Data Management System: Consolidated Panel Recommendations

An authoritative synthesis of systems architecture, data science, and software development perspectives for replacing fragmented Excel workflows with a single source of truth.

## Executive Summary
The MASB team currently operates across multiple disconnected Excel files—R1, R2, R3, Quotation Tracker, invoice_2026, cost_of_sales_2026, sales_report_2026-08-19, office_funnel_2026-08-19, and User Profiles Mapping. These files contain overlapping business entities such as programmes, clients, quotations, invoices, payments, participants, and funnel opportunities. The panel unanimously found that the root problem is not simply staff negligence, but the absence of a single source of truth and missing control loops. As the Systems Architect noted, staff are forced to update the same data in many places, so omissions and contradictions are inevitable.

The recommended solution is a programme-centric, centralised database delivered through a low-code/no-code platform such as Airtable, NocoDB, AppSheet, or Microsoft Power Apps/Dataverse. Data should be imported through a staging buffer with deduplication, validation, and conflict review before it is committed to canonical tables. A completeness engine must evaluate every programme against R1 and R2 components, highlight missing data on a dashboard, and treat N/A as an explicit, audited terminal state. Performance dashboards must clearly separate actual collection from forecast funnel. The system should be built in four phases, beginning with R1 invoice data and basic dashboard, then adding funnel, training statistics, and finally full export and automation.

This deliverable merges the findings of the panel without inventing figures. It attributes significant points to the disciplines that raised them, records disagreements where the panel diverged, and presents a phased roadmap that a non-developer can direct.

## Evidence Base and Current-State Data Audit
The panel examined the supplied source files: R1 MIMOS_Academy_INCOME_STATEMENT.xlsx, R2 Overall Report 2026, R3 Group 2026 Funnel Tracker, Quotation Tracker, invoice_2026.xlsx, cost_of_sales_2026.xlsx, sales_report_2026-08-19.xlsx, office_funnel_2026-08-19.xlsx, and User Profiles Mapping.xlsx. The Data Scientist observed that the same business objects are maintained in separate files and drift independently. For example, R1 and invoice_2026 contain almost identical invoice fields but different formats and row sets.

Concrete evidence of data quality problems was identified across all disciplines. R1 row 18 for MINDEF shows Payment Status PAID, while invoice_2026 row 18 shows UNPAID for what appears to be the same transaction. R2 contains formula errors such as #REF! and #DIV/0!, indicating broken calculations. The quotation number MASB/QT/TRA/2026/0036rev2 appears in R1 rows 10 and 12 with two different invoice values, which may be legitimate or a duplicate. Status vocabularies are inconsistent: R3 includes labels such as 'Contract signed/PO issued', 'Verbal commitment', and 'Qualified lead/Tender in progress', while office_funnel uses 'In Progress', 'Done', and 'Pending'. Staff names also vary, including 'Solehin' vs 'solehin' and 'Adila' vs 'Adilah'.

These observations form the foundation for the system design. They are not isolated typing errors; they are symptoms of fragmented data ownership, manual re-keying, and absent validation. The Software Developer emphasised that the supplied files should be treated as reports or staging sources, not as records of truth.

- Source files contain overlapping entities but no shared programme ID.
- Conflicting payment statuses exist for the same MINDEF record.
- R2 has broken formula references and merged header structures.
- Client names, staff names, quotation numbers, and statuses are not standardised.
- Office_funnel already records Created By, Updated At, Person In Charge, and Due Date, which can serve as an audit foundation.

## Contribution: Systems Architecture Perspective
The Systems Architect used Expert Opinion and Design Thinking lenses to argue that the target system should be built on a low-code/no-code platform rather than custom software. This is appropriate because the user is not a developer and the team already works in Excel/Google Sheets. A centralised relational database is needed to replace many spreadsheets. The Architect recommended modelling entities according to business reality: Programme/Project, Client, Quotation, PO, Invoice, Payment, TrainingStats/R2, FunnelOpportunity, and Staff. A programme can have many quotations, POs, invoices, payments, and participant records.

The Architect proposed a staged ingestion pipeline: Upload → Staging → Validation → Commit. Each upload should use a composite business key to detect duplicates, such as Quotation No + Invoice No + Company + Programme Title + Training Date. If a match is found, the system should update changed fields or ignore; if not, create a new record. The Architect also warned that overly strict matching could merge legitimate repeat programmes, so a manual review queue is required for near matches.

On dashboards and completeness, the Architect specified that every programme should present R1 and R2 components. Missing components trigger red highlights; N/A is considered satisfied. The Architect also recommended role-based access with three levels—Admin, PIC/Staff, and Viewer—and proactive alerts tied to programme owner, but cautioned against alert fatigue. The phased plan proposed Fasa 1 central database and R1 import; Fasa 2 R3 funnel; Fasa 3 R2 training data; Fasa 4 export, alerts, and full access control.

## Contribution: Data Science Perspective
The Data Scientist applied Expert Opinion and Root Cause Analysis to stress that all Excel files should be treated as staging sources, never as canonical records. The data load is only hundreds of rows, so the main burden is data quality and business rules, not high transaction volume. The Data Scientist recommended a low-code platform combined with Python/Pandas scripts for parsing and export, because low-code alone may struggle with fuzzy deduplication and complex Excel templates.

A major contribution was the concept of explicit business keys. Deduplication should not depend on a single column such as programme title or company name. For programmes, the key may be Quotation No + Company + Training/Project Title + Start Date. Invoices should use Invoice No, and if that is blank, Company + Invoice Date + Invoice Value. Funnel should use Client + Project/Opportunity + Forecast Value. The Data Scientist also proposed a two-tier dedupe: exact match first, then fuzzy match with manual review.

The Data Scientist introduced the idea of source priority for conflicts. When the same field appears in multiple files with different values, the system should determine which source is authoritative for each domain, expose conflicts, and avoid silent overwrites. For example, R1 could be the authority for income statements, invoice_2026 for invoice status, R3 for funnel, and R2 for participants and revenue. This prevents confusion such as the MINDEF payment status contradiction.

For dashboards, the Data Scientist defined formal metrics: Revenue from Final Charges, Collected from PAID records, Expected from UNPAID with future due dates, Pending/Overdue from UNPAID with Days Outstanding greater than zero, Funnel from Forecast Value, Weighted Funnel from Forecast Value multiplied by Probability, and Data Completeness as percentage of programmes with all components complete. These definitions must be agreed before visualisation.

## Contribution: Software Development Perspective
The Software Developer used Expert Opinion, Design Thinking, and Root Cause Analysis to argue for normalising data into one business database rather than maintaining Excel files. The R1, R2, and R3 files are reports to management, not sources of truth. The system should store core entities such as Programme, Client, Quotation, PO, Invoice, Payment, Participant, Funnel, and Action Item. Each report becomes a view generated from these entities.

The Developer emphasised an idempotent upsert process, not a simple append or ignore. The system must use clear business keys and a staging area. If the hash of a row is identical, skip; if the key is the same but fields are empty, fill the empty fields; if the key is the same but values differ, route to a conflict queue for human review. This is more robust than ignoring duplicates blindly, because revisions and corrections must not be lost.

The Developer also highlighted that a completeness engine must be rule-based. For example, if Payment Status is PAID, then Payment Date must exist. If Invoice No exists, Invoice Date and Invoice Value must exist. If a programme is Training, R2 participant counts must be completed. N/A should only be allowed with a reason and audit trail to prevent misuse. The Developer favoured a low-code platform with optional Python scripts for complex export, and recommended a parallel run with existing manual reports for one to two cycles before full go-live.

## Cross-Disciplinary Root Causes
All three disciplines converged on the same root causes. First, there is no single source of truth. The same entities are stored in many spreadsheets with conflicting values. Second, there are no unique identifiers for programmes, clients, invoices, or quotations. Third, status vocabularies are uncontrolled and mixed. Fourth, there is no explicit data lifecycle or machine state to distinguish missing data from not-applicable data. Fifth, manual report assembly and broken Excel formulas propagate errors. Sixth, there is no audit trail or role-based ownership to close the loop when data is incomplete.

The Systems Architect and Software Developer both used programme-centric thinking: R1, R2, and R3 are views of the same underlying programme. The Data Scientist framed this as a stock-and-flow problem, where Funnel/Opportunity flows to Quotation, then to Programme/PO, then to Delivery/Training, then to Invoice, then to Collection/Payment. Without relational links, each file becomes an island. This synthesis makes the business case for the new system.

## Recommended Target Architecture
The panel recommends a low-code/no-code platform with a real database underneath, rather than a fully custom web application. Suitable options include Airtable, NocoDB, Baserow, AppSheet, Budibase, Microsoft Power Apps with Dataverse, or a hybrid approach using Python scripts for complex import/export. The Systems Architect noted that all requirements—Excel import, deduplication, completeness status, dashboard, export, and alerts—fit within low-code capabilities for the current data volume.

The architecture should include: a canonical relational database; a staging area for uploaded files; a validation and deduplication engine; a completeness engine; a dashboard layer with role-based views; an export module for R1, R2, and R3; and an audit log. The Software Developer recommended starting with a read-only dashboard over a consolidated programme table, then adding forms, tasks, and automations. This reduces risk for a non-developer and allows the team to learn the system incrementally.

The Data Scientist added that the low-code platform should be treated as a system of record, with exports to Excel only for reporting. This prevents users from continuing to use spreadsheets as hidden sources of truth. The architecture must enforce relationships, dropdowns, validations, and audit logs at the platform level, not rely on staff discipline.

## Data Model and Master Data
The core entity is Programme/Project. Around it are related tables: Client, Quotation, PO, Invoice, Payment, Training Delivery, Participant, Funnel/Opportunity, Staff, and Action Item. This model was proposed by both the Systems Architect and Software Developer because a single programme can have multiple quotations, invoices, and deliveries. For example, R1 rows 10 and 12 show the same Leadership & Shared Vision programme with the same quotation number but two different invoice values, so the system must not merge them into one row.

Master data tables are necessary for Client, Staff, Category, Training Type, and Status. The Data Scientist and Root Cause Analysis both found that current values are inconsistent: MIMOS Berhad, MIMOS Services Sdn Bhd, MIMOS Solutions Sdn Bhd, and MIMOS Holding appear for the same group; staff names such as Adilah, Adila, and Adila/Fuziah are written differently. The system should store a controlled list with synonyms and a canonical value. Dropdowns should be loaded from these master tables.

The Data Scientist advised not to over-normalise at this stage. Start with the core entities listed above and add tables only when a clear business need emerges. The Systems Architect warned that a strict relational model requires cleaning and linking legacy data, so a phased golden record approach is preferable. Each programme should receive a system-generated ID, but the matching key for imports must be a composite of natural business fields.

- Programme is the primary entity; R1, R2, and R3 are views of it.
- Separate tables are needed for Quotation, Invoice, Payment, Participant, and Funnel.
- Master data controls Client, Staff, Status, and Category values.
- System-generated IDs link records, while composite natural keys detect duplicates.

## Import, Deduplication, and Staging
The import process must be idempotent and staged. The Systems Architect, Data Scientist, and Software Developer all independently recommended an Upload → Staging → Validation → Commit pipeline. The uploaded Excel file should be stored as an audit artefact. The system parses each row into a staging table, validates data types, normalises text and dates, checks for duplicates, and only then commits to the canonical tables.

Deduplication should use a composite business key, not a single field. The panel proposed different keys per entity: Programme = Quotation No + Company + Training/Project Title + Start Date; Invoice = Invoice No as primary key, falling back to Company + Invoice Date + Invoice Value if blank; Funnel = Client + Project/Opportunity + Forecast Value. Because source data contains variations such as quotation revisions, pending invoice placeholders, and inconsistent company names, exact matching alone is insufficient. A fuzzy matching layer with a confidence score and a manual review queue is required.

The Data Scientist proposed three import rules: if the full row hash is identical, skip; if the key matches but fields are blank, fill blank fields; if the key matches but source values conflict, route to a conflict queue. The Software Developer added that the system must store source_file, source_row, checksum, and imported_at for every record. This preserves a complete audit trail and enables reversibility.

The Systems Architect warned that the user's original request to 'ignore data if it exists' is dangerous if it silently ignores updates. A conflict queue is safer. The panel agreed that after fuzzy matching matures, a trusted admin quick-import path can be added, but only after validation rules have been proven.

## Completeness Engine and N/A Governance
Every programme must have a defined set of components derived from R1 and R2: Quotation, PO, Invoice, Payment, Delivery, Participants, Charges, and PIC. The system evaluates each component as Complete, Missing, N/A, or Invalid. The dashboard highlights incomplete programmes. If a user sets N/A, the system treats the component as satisfied and stops highlighting it, but N/A must be an explicit audited action, not a silent default.

The Data Scientist specified rules such as: if Payment Status is PAID, Payment Date is mandatory; if Invoice No exists, Invoice Date and Invoice Value are mandatory; if Total Charges is greater than zero, SST and Final Charges are mandatory; if the programme is Training, participant counts are mandatory. The Software Developer argued that too many alerts will cause staff to mark everything N/A, so N/A should require a reason, and only certain roles should be able to set it for critical financial fields. The Systems Architect suggested restricting N/A for financial components and requiring approval for financial N/A.

The panel agreed that completeness must be a balancing feedback loop: incomplete data triggers a task assigned to the programme owner, and when the data is updated, the task closes and the highlight disappears. The office_funnel file already contains Person In Charge, Due Date, and Status, which can be extended to all programme components. The Data Scientist warned that the system must distinguish between missing because not yet available and missing because not applicable; without this distinction, the dashboard cannot be reliable.

## Performance Dashboard and Metrics
The business performance dashboard must separate actuals from forecasts. The Software Developer and Data Scientist both insisted on this to avoid misleading management. The dashboard should have distinct blocks: Revenue, Collected, Expected, Pending/Overdue, Funnel, Weighted Funnel, and Data Completeness. The Systems Architect recommended role-based views: executives see high-level cash and pipeline; PICs see their incomplete programmes and action items.

The Data Scientist provided formal definitions based on source fields: Revenue = total Final Charges; Collected = Final Charges for PAID records; Expected = Final Charges for UNPAID records with future Due Dates; Pending/Overdue = Final Charges for UNPAID records with Days Outstanding greater than zero; Funnel = sum of Forecast Value by status; Weighted Funnel = Forecast Value multiplied by Probability percentage; Data Completeness = percentage of programmes with all components complete. These definitions must be agreed once and enforced in the system.

The Systems Architect warned not to mix SST-inclusive and SST-exclusive values. The source files contain both, for example R1 has invoice value excl tax and total value, while R2 has Total Charges, SST 8%, and Final Charges. The dashboard must choose one canonical definition, for example Revenue excluding SST, and label all metrics accordingly. The Data Scientist added that cost_of_sales_2026 currently shows 100% profit because cost fields are blank; any profitability metric must be accompanied by a data completeness warning.

The panel recommended limiting the top dashboard to four to six KPIs to avoid alert fatigue. All underlying details should be available in drill-down pages. The dashboard should also surface data quality issues, such as overdue unpaid invoices, missing participant information, or invoices not yet issued after training delivery.

## Export and Reporting
The system must export three types of Excel reports: R1 income statement, R2 overall training report, and R3 funnel report. The Software Developer and Data Scientist both argued that these reports should be generated from clean database tables, not by reproducing the current broken files. R2 in particular has merged cells, nested headers, and formula errors; replicating that structure exactly would carry forward errors. Instead, the system should use versioned clean templates with placeholders filled from the database.

The Data Scientist recommended a hybrid approach: use the existing R1/R2/R3 files as visual templates, but strip broken formulas and normalise columns. The system stores a canonical data dictionary, and the export module maps canonical fields to the report layout. This allows management to receive reports that look similar to the current ones but are internally consistent.

The Systems Architect noted that export templates should be version-controlled and editable by an admin. The panel agreed that the initial export may not match the original format 100%, but the trade-off is acceptable because the new output will be more reliable. Users should be told in advance that export files are cleaner versions, not raw copies.

## Roles, Notifications, and Audit Trails
User Profiles Mapping contains 18 MASB_Team staff plus one Super Admin. The Systems Architect and Software Developer recommended three initial roles: Admin, PIC/Staff, and Viewer. Admin can upload files, manage master data, approve N/A, and unlock records. PIC/Staff can update their assigned programmes and data components. Viewer can see dashboards and reports but cannot edit. The Data Scientist added that role-based ownership should reuse existing Account Manager and PIC fields rather than creating new organisational structures.

Notifications must be targeted, not broadcast. The Systems Architect warned that excessive alerts will be ignored. The Data Scientist and Software Developer proposed specific triggers: 7 days before a due date, 3 days after a missed due date, and 30 days overdue. Notifications should go only to the responsible PIC/Account Manager and optionally their supervisor. The office_funnel file already contains Person Email and Due Date, which can be leveraged.

Every change must be recorded in an audit log with who changed what and when. The Data Scientist noted that office_funnel already has Created At and Updated At, but R1/R2/R3/invoice files do not. The system must add field-level history for critical fields such as Payment Status, Invoice No, and Funnel Stage. The Software Developer recommended limiting audit logs to critical fields first, then expanding to all fields if performance allows.

## Points of Disagreement and Residual Risks
The panel did not fully agree on all implementation details. The Systems Architect and Data Scientist favoured a low-code platform with Python scripts, while the Software Developer was more open to a hybrid but emphasised that low-code may struggle with complex export templates and fuzzy dedupe. This is a difference in emphasis, not direction. Another divergence was the strictness of N/A controls: some panel members wanted N/A to require approval for financial fields, while others accepted a reason field only. The safest synthesis is to require a reason for all N/A, and additional approval for financial N/A.

The panel also disagreed on how faithfully the exported R2 report should mimic the current merged-cell layout. The Data Scientist and Software Developer argued for a clean canonical template, while the Systems Architect was willing to accept minimal visual fidelity if it improves reliability. The final position is to use clean templates that resemble the current reports but remove broken formulas and ambiguous merged structures.

Residual risks include: data migration may initially consume significant effort; staff may continue using Excel if the new system is harder to use; low-code platforms may hit limits as data grows; N/A can be misused to hide missing data; fuzzy dedupe can create false positives. The phased approach and parallel run mitigate these risks. The panel recommended measuring adoption and data completeness after each phase before proceeding.

## Phased Implementation Roadmap
The panel converged on a four-phase roadmap. Phase 1 focuses on the foundation: set up the central database, import R1 invoice data, build the programme master table, implement staging and deduplication with a conflict queue, and create a basic executive dashboard showing Revenue, Collected, Outstanding, and Overdue. The Systems Architect and Software Developer both recommended starting with R1 because it is the most structured and critical for financial visibility.

Phase 2 adds funnel: import R3 data, link opportunities to programme and client records, implement funnel status standardisation, and add Weighted Funnel and Secured Order Book metrics to the dashboard. Phase 3 adds R2 training statistics: import participant counts, Bumiputera vs Non-Bumiputera breakdown, revenue by training type, and activate the completeness engine that checks R1 and R2 components together. This is where the N/A governance and PIC assignments become operational.

Phase 4 completes the system: implement R1/R2/R3 export templates, automated notifications and reminders, role-based access with audit logs, and a parallel run. The Data Scientist and Software Developer both recommended running the new system in parallel with existing manual reports for one or two reporting cycles before switching off the old Excel process. Acceptance criteria should include: no new duplicate programme records after upload, all overdue unpaid invoices visibly flagged, all training programmes have participant data or explicit N/A, and exports are generated from the database without manual edits.

This roadmap is intentionally incremental to reduce risk for a non-developer. Each phase delivers visible value and builds confidence before the next phase expands scope. The panel recommended assigning a super user or small working group to own the system during rollout and to provide feedback for iteration.

- Phase 1: Central database + R1 import + dedupe + basic financial dashboard.
- Phase 2: R3 Funnel import + standardised funnel stages + weighted pipeline metrics.
- Phase 3: R2 TrainingStats import + completeness engine + N/A governance + PIC assignments.
- Phase 4: R1/R2/R3 exports + automated alerts + role-based access + parallel run.

## Conclusion and Acceptance Criteria
The new system should be judged successful if it eliminates the fragmentation that currently causes incomplete and contradictory data. Management should be able to open one dashboard and see the real state of revenue, collections, overdue items, and pipeline without reconciling multiple Excel files. Staff should have a clear list of their incomplete programmes and tasks, with automatic reminders rather than relying on memory.

The panel's final recommendation is to proceed with a programme-centric, low-code central database, staged import with composite-key deduplication, rule-based completeness with audited N/A, separated actual and forecast metrics, and phased rollout. By following the four phases and running in parallel before cutover, MIMOS Academy can achieve the reliable reporting system that the current spreadsheets cannot provide.