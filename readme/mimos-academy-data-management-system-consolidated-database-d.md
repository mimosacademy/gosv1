# MIMOS Academy Data Management System: Consolidated Database Design, Table List, ERD, Relationship Diagram, and Data Dictionary

Merged panel deliverable synthesizing findings from systems architecture, data science, software development, product management, and quality assurance

## Executive Summary
This deliverable consolidates the panel's findings into a single authoritative database design for MIMOS Academy. The panel examined nine uploaded Excel files as symptom reports and staging sources, not as records of truth. The central conclusion is that the target system must be programme-centric: one canonical table per business entity, fed through a controlled staging layer that validates, deduplicates, and resolves conflicts before any data enters canonical tables.

The panel identified that the largest structural problem is the absence of shared identifiers across quotation, invoice, payment, training delivery, funnel, and task-management data. Several files overlap and contradict one another; for example, R1 and invoice_2026 disagree on payment status for the same apparent MINDEF transaction, and R1 rows 10 and 12 share quotation MASB/QT/TRA/2026/0036rev2 but carry different invoice values and invoice numbers.

The recommended design separates concerns into distinct entities: client, staff, programme, quotation, purchase_order, invoice, payment, training_stat, opportunity, action_item, account, and supporting reference tables. It uses surrogate primary keys plus composite business keys, and it enforces a staging buffer with manual review for near-match duplicates. The design also separates forecast, actual, delivery, and task data to prevent double counting.

The remainder of this document covers the evidence base, each discipline's contribution, the canonical table list, composite key strategy, staging and validation architecture, master data governance, financial modeling, separation of funnel and actuals, training statistics normalization, ERD and relationship diagram, data dictionary overview, status governance, points of disagreement, risks, and a phased implementation recommendation.

## Evidence Base and Source Material
The panel reviewed nine source files. The Quality Assurance Lead classified all spreadsheets as untrusted staging sources because direct import would replicate conflicting truths. The Systems Architect (Expert Opinion) treated the files as symptom reports: R1 and invoice_2026 contain nearly identical invoice fields but different row sets and formats; R2 contains training statistics for programmes that R1 invoices; R3 and sales_report overlap as funnel data; office_funnel tracks tasks for the same clients.

The uploaded files are: R1 MIMOS_Academy_INCOME_STATEMENT.xlsx, invoice_2026, cost_of_sales_2026, R2 Overall Report 2026, R3 Group 2026 Funnel Tracker, sales_report_2026-08-19, office_funnel_2026-08-19, 00. Quotation Tracker (1).xlsx, and User Profiles Mapping.xlsx. Together they represent demand generation, contracting, delivery, billing, payment, costing, workforce, and task management.

The most serious source-data issues include formula errors in R2 such as #REF! and #DIV/0!, placeholder invoice numbers like 'Pending @ Fin' in invoice_2026, inconsistent date formats, and free-text staff and client names. The Product Manager (Root Cause Analysis) traced these symptoms to disconnected Excel files designed as standalone reports or trackers, not as relational source records.

For ERD notation and tooling, the Systems Architect (Expert Opinion) noted that standard tools such as WorksCove and DbSchema can later render the diagram from the confirmed table list and relationships. This document provides the logical design; no code or DDL is generated at this stage.

- R1 MIMOS_Academy_INCOME_STATEMENT.xlsx — invoice-level actual revenue and payment status.
- invoice_2026 — near-duplicate invoice dataset with divergent formats and statuses.
- cost_of_sales_2026 — collection and cost/profit fields, currently incomplete.
- R2 Overall Report 2026 — training participant statistics with formula errors.
- R3 Group 2026 Funnel Tracker — opportunity pipeline with forecast and probability.
- sales_report_2026-08-19 — alternative funnel snapshot with salesman and sector.
- office_funnel_2026-08-19 — operational action items and tasks.
- 00. Quotation Tracker (1).xlsx — quotation-level commercial details.
- User Profiles Mapping.xlsx — staff names, roles, emails.

## Methodological Contributions by Panel Discipline
Each discipline examined the same source material through a different lens. The Systems Architect (Expert Opinion) produced the programme-centric canonical schema, composite business key rule, and ERD notation. The Data Scientist (Systems Thinking) treated the spreadsheets as interacting subsystems and identified the missing programme ID, staging feedback loop, lifecycle state separation, and normalized money principles.

The Software Developer (Design Thinking) used an empathize-define-ideate-prototype-test process. This contribution highlighted role-based views, the need for a common engagement entity, unreliable quotation numbers, and a phased validation model. The Product Manager (Root Cause Analysis) focused on causal data defects such as missing shared identifiers, mirror-file drift, uncontrolled status vocabulary, ambiguous account/legal entity fields, and semantically misused financial fields.

The Quality Assurance Lead (Expert Opinion) provided quality gates: staging untrusted sources, composite keys plus surrogates, normalized client and staff master data, controlled lookup tables, decimal and tax discipline, forecast/actual separation, programme-centric relationships, document-chain integrity, completeness enforcement, and auditability. The second Systems Architect contribution applied systems thinking to argue that client and account are separate dimensions, quotation/PO/invoice need revision handling, payment collection must be independent of invoice status, staff must be first-class, and R2 wide columns must be unpivoted.

The Data Scientist (Design Thinking) contributed a canonical table list, tested the model against source quirks, and emphasized that derived fields should be computed on read. The Software Developer (Root Cause Analysis) supplied schema-critical defect evidence for programme IDs, status vocabularies, financial presentation-formatted values, missing staff master, incomplete document references, R2 report rows, client/contact conflation, and duplicate invoice/collection data. These combined findings form the basis for the integrated design below.

## High-Level Database Design Philosophy
The design is programme-centric. The Systems Architect (Expert Opinion) recommended that programme be the anchor entity; quotations, POs, invoices, payments, training statistics, and opportunities all link back to a programme. The Data Scientist (Systems Thinking) reinforced this by stating that a programme/project ID is the missing binding element, without which the system cannot reconcile quotation to invoice to training delivery to payment.

All uploaded spreadsheets should be imported into staging tables that mirror each source file one-to-one. The canonical tables are not file-shaped. Instead, each business object has one canonical table, and conflicts are resolved in staging before commit. The Quality Assurance Lead insisted that every source file be treated as a black-box staging source, not the system of record.

The design uses surrogate primary keys for stable joins and composite business keys for duplicate detection. The Data Scientist (Design Thinking) argued that pure natural-key matching is fragile and pure surrogate keys ignore import duplicate detection; therefore, the model must combine both. Near-duplicate matches must enter a manual review queue rather than auto-commit.

The Product Manager (Root Cause Analysis) warned that a central database will only remove re-keying if R1 and invoice_2026 are treated as staging sources and one canonical invoice table is designated as truth. Export views or saved filtered views can preserve familiar spreadsheet-like outputs for different roles without reintroducing fragmentation.

## Staging, Validation, and Quarantine Architecture
Every source file must be imported into a staging table that mirrors the raw Excel columns exactly. The Systems Architect (Expert Opinion) proposed staging tables such as stg_invoice, stg_quotation, stg_funnel, stg_training_stat, stg_action_item, and stg_staff, each with additional row_hash, source_file, imported_at, and validation_status columns.

The Data Scientist (Systems Thinking) described the required feedback loop: upload, stage, validate, commit, review. This prevents broken formulas, blank identifiers, and conflicting statuses from entering canonical tables. The Quality Assurance Lead added that staging plus human review is slower but necessary; skipping it would make the single source of truth a permanent source of errors.

The Software Developer (Design Thinking) argued for a quarantine layer rather than a hard reject-all approach. Invalid rows should be held in quarantine, with completeness scoring per entity, while N/A is treated as an explicit audited terminal state rather than a missing value. The Product Manager (Root Cause Analysis) cautioned that overly strict validation may block legitimate historical data; the pipeline should allow orphan records and flag them for review.

Audit and lineage must be present from day one. The Quality Assurance Lead recommended extending office_funnel's existing Created By, Created At, and Updated At pattern across all canonical tables. The Software Developer (Root Cause Analysis) noted that without lineage, conflict resolution between R1 and invoice_2026 becomes impossible.

bullets

## Master Data: Staff, Client, Contact, and Legal Entity
Staff must be a first-class entity with canonical identifiers. The Data Scientist (Systems Thinking) pointed out that Account Manager, PIC, Prepared By, Salesman, and Person In Charge are free-text names with many spelling variations. The Software Developer (Root Cause Analysis) confirmed that User Profiles Mapping lists canonical staff, but source files vary: Adilah vs Adila, Solehin vs solehin, Abu Sa'id vs Abu Said.

The Product Manager (Root Cause Analysis) found that some active team members are absent from User Profiles Mapping, and some entries combine people as free text such as Adila/Fuziah. The recommended staff table uses email as a strong natural matching key, but the primary key is an internal staff ID. Staff aliases must be mapped before linking financial and task records.

Client and account are separate dimensions. The Systems Architect (Systems Thinking) emphasized that accounts used in financial files are not always the client; they describe which MIMOS entity issued the invoice. The Product Manager (Root Cause Analysis) found that the Account field conflates legal entity, business unit, payment account, and client name. Examples include MIMOS Berhad, MIMOS Services Sdn Bhd, MIMOS Solutions Sdn Bhd, and Mimos Holding, with account values MIMOS, MB, and MSSB varying across files.

Contact information should be separated from client and staff tables. The Software Developer (Root Cause Analysis) noted that Quotation Tracker has Company/Client, PIC - Full Name, PIC - Contact No, and PIC - Email Add; office_funnel has Person In Charge and Person Email. A Client_Contact junction table or separate Contact entity is needed to handle multiple contacts per client and to distinguish internal PIC from client-side contact.

## Financial Data Modeling and Payment Lifecycle
The panel agreed that financial amounts must be normalized, not stored as independent totals. The Data Scientist (Systems Thinking) found that multiple files repeat total value, SST, and final charges, causing rounding errors and contradictions. For example, Quotation Tracker stores Unit Price without SST, Unit Price with SST 8%, Total Price without SST, Total Price with SST 8%, SST 8% Amount, Discount %, and Final Price. R1 row 2 records SST as 147.41 while invoice_2026 row 2 records SST as 147.4072.

The QA Lead set a quality gate: money, tax, and totals must be stored as constrained numeric fields with explicit rounding and null-vs-zero rules. Base amount and SST should be stored as decimals; total should be derived for display where feasible. The Data Scientist (Design Thinking) added that computed values such as Days Outstanding, weighted forecast, and profit percent should be calculated on read rather than stored as authoritative.

Payment must be a separate entity from invoice status. The Data Scientist (Systems Thinking) argued that a single PAID/UNPAID flag cannot represent partial payments, deposits, multiple collections, or payments before invoice date. The Systems Architect (Systems Thinking) cited R1 row 4 Efficient Frontier Consulting showing Payment Date 31-Jan-26 while Invoice Date is 9-Feb-26, indicating prepayment. The recommended payment table supports one-to-many collection events per invoice.

The Product Manager (Root Cause Analysis) found that financial lifecycle fields are semantically misused. cost_of_sales rows show Collection equal to invoice value even though Payment Date is No Data and invoice status is UNPAID; all cost_of_sales rows show Cost of Sales = 0, Commission = 0, and BRO Incentive = 0, producing 100% profit, which is unlikely. The schema must separate invoice, receipt/payment allocation, and cost allocation rather than storing typed summaries.

## Funnel, Actuals, and Action-Item Separation
Forecast, actual, delivery, and task data must remain in separate entities. The Software Developer (Design Thinking) argued that mixing pipeline forecasts with actual revenue in one table leads to misleading dashboards. R3 and sales_report are forecast/funnel; R1 and invoice_2026 are actual financial transactions; office_funnel contains both action items and potential revenue.

The Systems Architect (Expert Opinion) called the action_item table the operational link between sales pipeline and back office, and insisted it must not be merged into opportunity or programme. The Data Scientist (Systems Thinking) added that office_funnel is an operational task list, not a sales pipeline, and mixing it with R3 or sales_report would distort pipeline analysis.

The Quality Assurance Lead confirmed that R3 and sales_report have Forecast Value and Weighted, invoice_2026 and cost_of_sales have actual invoice/collection, and office_funnel has Potential Revenue on action items. Storing all of these in one table would double count revenue. The recommended model has an opportunity table for pipeline stages and probabilities, an invoice table for committed revenue, a payment table for realized cash, and an action_item table for workflow.

The Software Developer (Root Cause Analysis) noted that funnel data lacks a stable lifecycle key and duplicates records across R3 and sales_report. The schema needs an opportunity ID, stage, probability, and forecast value, with the weighted value either computed or stored as a snapshot; this is addressed under points of disagreement.

## Training Statistics and Delivery Outcomes
R2 must be normalized away from wide report columns. The Systems Architect (Systems Thinking) observed that R2 encodes training participants in wide categorical columns: WAFER FAB, FA/MA, AI, OTHERS, each split into Workshop/Training/Total, plus Bumiputera and Non-Bumiputera. This is a report layout, not a data model.

The Software Developer (Root Cause Analysis) added that R2 is a human-readable report with computed totals, not a normalized source. It contains quarterly totals and YTD rows such as As of Q1'2025, 229, 22, 251, and includes broken formulas. The canonical schema should store participant facts in a training_stat table linked to programme, with category and demographic dimensions.

The Data Scientist (Systems Thinking) recommended that training delivery and participant data belong in separate outcome tables, not embedded in invoice tables. This prevents redundant financial amounts and allows clean training impact reporting. The panel agreed that recomputing aggregates from participant records is more maintainable than storing precomputed summary rows, though there is a historical reconciliation burden.

The training_stat table should include programme_id, training category, participant count, bumiputera flag or demographic type, source row, and audit fields. It should not contain invoice value or financial totals as primary facts; those belong to the invoice and payment entities.

## ERD and Relationship Diagram
The logical ERD centres on the programme entity. The Systems Architect (Expert Opinion) provided a relationship skeleton in which Client one-to-many Programme, Staff one-to-many Programme as Account Manager or PIC, Programme one-to-many Quotation, Quotation one-to-many Purchase_Order, Programme one-to-many Purchase_Order, Programme one-to-many Invoice, Quotation one-to-many Invoice, Purchase_Order one-to-many Invoice, Invoice one-to-many Payment, Programme one-to-many Training_Stat, Client one-to-many Opportunity, Programme one-to-many Opportunity, Client one-to-many Action_Item, Staff one-to-many Action_Item, and Invoice many-to-one Account.

The cardinalities reflect observed data: the model allows invoices without a preceding quotation or PO because some R1 and invoice_2026 rows have empty PO or quotation numbers. The Systems Architect (Systems Thinking) added optional link Opportunity zero-or-one to one Programme when an opportunity wins, and Staff one-to-many Programme as Account Manager or PIC via nullable foreign keys.

The relationship diagram describes business flow, not just referential integrity. The Systems Architect (Expert Opinion) outlined a flow from Opportunity/Lead to Quotation to Purchase Order to Invoice to Payment, with Quotation also leading to Programme delivery, Programme leading to Training Stats, and Action_Item supporting both Opportunity and Invoice follow-up. The action_item entity is the operational link between sales pipeline and back office.

For rendering the visual diagram, standard Crow's Foot or UML notation is sufficient. The Systems Architect (Expert Opinion) noted tools such as WorksCove or DbSchema can generate the diagram from the confirmed table list. This document supplies the entities, relationships, and cardinalities; the visual rendering may follow after table names are finalized.

## Data Dictionary Overview and Source Mapping
The data dictionary maps each source column to a target column, logical type, nullability, and validation rule. The Data Scientist (Design Thinking) argued that a complete data dictionary is the basis for import, validation, and deduplication. Source columns are inconsistent across files: R1 has Revenue, Invoice value excl tax, Total value, and Amount Collection w/o SST; invoice_2026 has Invoice Value (excl tax), SST (8%), and Total (incl SST); cost_of_sales has Invoice Value, Collection, Cost of Sales, and Revenue.

The QA Lead specified that each entity must have mandatory fields per entity and explicit N/A terminal states rather than blanks. Missing values should produce warnings, while N/A is a valid audited state. The Software Developer (Root Cause Analysis) added that financial fields currently contain leading spaces and commas such as ' 8,500.00 ', and SST uses - or blank; the canonical dictionary must treat missing SST as nullable, not zero.

Representative fields include client.company_name normalized and deduplicated; staff.email unique and lower-case; programme.title as training/project title; quotation.quotation_no with revision suffix; invoice.invoice_no with document_status separate from placeholder text; payment.amount and payment_date; training_stat.category, participant_count, and demographic flags; opportunity.stage, probability, forecast_value, and weighted_value; action_item.owner, due_date, and status; and account.name for MSSB/MIMOS/MB.

The dictionary should also record derivation rules for computed fields such as total, days_outstanding, and weighted_forecast. The Data Scientist (Design Thinking) recommended validating incoming totals against excl_tax + sst rather than trusting source totals. The Quality Assurance Lead noted that lineage and audit fields must be included for every table.

## Status and Reference Data Governance
Status vocabularies are uncontrolled and inconsistent across files. The QA Lead set a quality gate to codify every status, payment method, account, and category into lookup tables. The Software Developer (Root Cause Analysis) found that R3 uses Contract signed/PO issued, Verbal commitment, and Qualified lead/Tender in progress, while office_funnel uses In Progress, Done, Pending, and sales_report uses Proposal/Tender submitted.

The Product Manager (Root Cause Analysis) identified that TNB ILSAS 240,000 is Qualified lead/Tender in progress in R3 row 5 but Proposal/Tender submitted in sales_report row 4. A single global status list would be simpler but incorrect; the design needs separate status domains for opportunity lifecycle, invoice lifecycle, payment lifecycle, task lifecycle, and document status.

Account, sector, training type, and payment method should also be controlled. Account values include MSSB, MIMOS, and MB; sector values include Government, Private, and Internal; payment methods include HRDCorp Claimable, Self-Pay, and ePerolehan. The Data Scientist (Systems Thinking) emphasized that controlled vocabularies enable dropdowns and consistent filtering while preventing file authors from inventing labels.

The QA Lead recommended including unknown or legacy mapping values for the migration period rather than rejecting imports outright. This allows historical data to flow into canonical tables while new records are constrained to approved lookup values.

## Points of Disagreement and Design Trade-offs
The panel agreed on the main architecture but disagreed on several implementation choices. The first point of disagreement concerns derived financial totals. The Data Scientist (Design Thinking) argued strongly that derived fields such as weighted_forecast, days_outstanding, total_value, and profit_percent should be computed on read and not stored. The Software Developer (Root Cause Analysis) countered that storing weighted value as a snapshot preserves historical auditability at the cost of potential drift from recalculation. The QA Lead leaned toward storing base/SST as decimals and deriving totals for display, but acknowledged that historical rounding may differ.

A second disagreement involves validation strictness. The QA Lead recommended a completeness engine with mandatory fields per entity and red-flag rules. The Software Developer (Design Thinking) and Product Manager (Root Cause Analysis) cautioned that overly strict validation may block import of real but messy records. The compromise is a quarantine layer with completeness scoring and an Unknown/Legacy mapping for legacy statuses, rather than hard rejection.

A third disagreement relates to R2 aggregate rows. The Data Scientist (Systems Thinking) and Software Developer (Root Cause Analysis) recommended recomputing aggregates from participant records. The Systems Architect (Systems Thinking) noted that historical wide-table import can be unpivoted, but some panel members acknowledged that storing precomputed summary rows is simpler and replicates existing Excel convenience. The final design opts for normalized participant facts with derived summaries.

A fourth point of disagreement is role granularity. User Profiles Mapping contains only MASB_Team and Super Admin. The Software Developer (Design Thinking) observed that this is insufficient for permission granularity. However, the panel did not reach a final role matrix; the schema includes staff role fields and audit fields, with role-based access to be defined during implementation.

Finally, there was disagreement on how quickly to pursue full normalization. Some panel members argued that too many small tables increase low-code configuration effort. The panel compromise is a moderately normalized core with clear foreign keys, joined views for reports, and saved role-based filters rather than isolated modules.

## Risks and Constraints
The largest risk is data migration from messy spreadsheets. The Product Manager (Root Cause Analysis) warned that centralizing data could fail if the team resists losing familiar spreadsheets; export views and staged import are needed. The Quality Assurance Lead added that staging plus manual review is slower, but skipping it means the single source of truth becomes a permanent source of errors.

A second risk is incomplete or contradictory financial data. cost_of_sales_2026 currently shows Cost of Sales = 0 for every row, producing 100% profit, which is unlikely and suggests costs are not yet entered. Collection values equal invoice values even when Payment Date is No Data. The schema cannot fix missing data; it can only expose it. The financial model will flag these rows until costs and receipts are properly recorded.

A third risk is over-normalization. The Software Developer (Design Thinking) noted that many small tables can increase low-code configuration effort. The panel mitigates this by providing joined views and role-based dashboards over the normalized core.

A fourth risk is manual review bottleneck. Near-match duplicate detection requires human judgment for legitimate repeat programmes versus duplicates. The Systems Architect (Expert Opinion) and Data Scientist (Design Thinking) both recommended a manual review queue. If the review queue is not staffed, imports will stall or auto-merge will occur without audit.

Finally, source files contain formula errors and inconsistent dates that may hide additional data issues. R2 has #REF! and #DIV/0!, and date formats vary between DD-MMM-YY and MM/DD/YY. The staging engine must normalize these before commit, and invalid rows must be quarantined rather than silently discarded.

## Phased Recommendation
The panel recommends a phased implementation that validates the model with real source data before adding complexity. Phase 1 focuses on central database and R1 import. This includes creating the canonical client, staff, programme, invoice, payment, and account tables; staging R1; normalizing client and staff master data; validating invoice amounts and payment statuses; and resolving the R1 vs invoice_2026 conflicts for the same invoice set.

Phase 2 imports the funnel data. Add opportunity and action_item staging from R3, sales_report, and office_funnel; implement status lookup tables for opportunity stages; link opportunities to client and optional programme; and separate action items from revenue opportunities. This phase validates the forecast/actual separation.

Phase 3 imports training statistics and quotation/PO details. Add training_stat from R2 after unpivoting wide columns; add quotation and purchase_order tables from Quotation Tracker and R1; link quotations to invoices and programmes; and define revision handling. This phase reconciles delivery outcomes with invoiced programmes.

Phase 4 completes payment/cost and operational workflow. Import cost_of_sales collection and cost data into the payment and cost allocation model; add action_item and task management from office_funnel; implement completeness scoring and red-flag reports; enable role-based dashboards; and enforce controlled vocabularies for all new data entry.

At each phase, the team should run the data dictionary validation rules and review the near-match duplicate queue before moving to the next phase. The Quality Assurance Lead's completeness engine should be activated as soon as canonical tables exist, so that missing and conflicting data are visible from the first import.