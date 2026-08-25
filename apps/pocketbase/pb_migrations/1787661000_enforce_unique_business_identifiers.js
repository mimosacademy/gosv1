/// <reference path="../pb_data/types.d.ts" />

// Data-integrity hardening for business identifiers.
// These identifiers are document/master numbers and must not be duplicated.
// The migration intentionally fails if existing duplicate data is present,
// rather than silently deleting or rewriting business records.

const UNIQUE_INDEXES = [
  ["programmes", "idx_programmes_code_unique", "code"],
  ["quotations", "idx_quotations_quote_no_unique", "quoteNo"],
  ["purchase_orders", "idx_purchase_orders_po_no_unique", "poNo"],
  ["invoices", "idx_invoices_invoice_no_unique", "invoiceNo"],
  ["payments", "idx_payments_payment_no_unique", "paymentNo"],
];

migrate(
  (app) => {
    for (const [collectionName, indexName, fieldName] of UNIQUE_INDEXES) {
      const col = app.findCollectionByNameOrId(collectionName);
      const duplicateCount = app.db().newQuery(`
        SELECT COUNT(*) AS duplicateGroups
        FROM (
          SELECT ${fieldName}
          FROM ${collectionName}
          WHERE ${fieldName} != ''
          GROUP BY ${fieldName}
          HAVING COUNT(*) > 1
        )
      `).one();

      if (Number(duplicateCount.duplicateGroups) > 0) {
        throw new Error(
          `Cannot enforce unique ${collectionName}.${fieldName}: duplicate non-empty values exist. Resolve duplicate records before applying this migration.`
        );
      }

      col.indexes = col.indexes || [];
      if (!col.indexes.some((index) => index.includes(indexName))) {
        col.indexes.push(`CREATE UNIQUE INDEX ${indexName} ON ${collectionName} (${fieldName})`);
        app.save(col);
      }
    }
  },
  (app) => {
    for (const [collectionName, indexName] of UNIQUE_INDEXES) {
      const col = app.findCollectionByNameOrId(collectionName);
      col.indexes = (col.indexes || []).filter((index) => !index.includes(indexName));
      app.save(col);
    }
  },
);
