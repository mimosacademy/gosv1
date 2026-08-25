/// <reference path="../pb_data/types.d.ts" />

// Complete enterprise data model for the MIMOS Academy PMS.
// Programme is the central entity. All collections are shared internal
// enterprise data — any authenticated staff member can read/write.
// Business flow: Opportunity → Quotation → Purchase Order → Programme
// → Training Delivery → Invoice → Payment Collection.

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const R = "@request.auth.id != ''"; // shared internal enterprise data

    const autodate = [
      { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    ];

    function make(name, fields, indexes) {
      let col;
      try {
        col = app.findCollectionByNameOrId(name);
      } catch (_) {
        col = new Collection({
          type: "base",
          name: name,
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: R,
          fields: fields.concat(autodate),
          indexes: indexes || [],
        });
        app.save(col);
      }
      return col;
    }

    const rel = (name, target, required, maxSelect) => ({
      name: name,
      type: "relation",
      required: !!required,
      maxSelect: maxSelect || 1,
      collectionId: target.id,
      cascadeDelete: false,
    });

    // 1. Clients — root entity, owns opportunities, quotations, programmes.
    make("clients", [
      { name: "name", type: "text", required: true, max: 200 },
      { name: "industry", type: "text", max: 100 },
      { name: "contactPerson", type: "text", max: 150 },
      { name: "email", type: "email" },
      { name: "phone", type: "text", max: 40 },
      { name: "location", type: "text", max: 120 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Active", "Prospect", "Inactive"],
      },
      { name: "since", type: "text", max: 20 },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_clients_status ON clients (status)"]);

    const clients = app.findCollectionByNameOrId("clients");

    // 2. Client contacts — many contacts per client.
    make("client_contacts", [
      rel("client", clients, true),
      { name: "name", type: "text", required: true, max: 150 },
      { name: "title", type: "text", max: 100 },
      { name: "email", type: "email" },
      { name: "phone", type: "text", max: 40 },
      { name: "isPrimary", type: "bool" },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_client_contacts_client ON client_contacts (client)"]);

    // 3. Programmes — the CENTRAL entity.
    make("programmes", [
      rel("client", clients, true),
      { name: "code", type: "text", required: true, max: 50 },
      { name: "title", type: "text", required: true, max: 200 },
      { name: "category", type: "text", max: 80 },
      { name: "startDate", type: "date" },
      { name: "endDate", type: "date" },
      { name: "venue", type: "text", max: 150 },
      { name: "pic", type: "text", max: 100 },
      { name: "trainer", type: "text", max: 100 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Scheduled", "In Progress", "Completed", "On Hold"],
      },
      { name: "participants", type: "number" },
      { name: "progress", type: "number", min: 0, max: 100 },
      { name: "contractValue", type: "number", min: 0 },
      { name: "sessionsPlanned", type: "number" },
      { name: "sessionsDelivered", type: "number" },
      rel("createdBy", users, true),
    ], [
      "CREATE INDEX idx_programmes_client ON programmes (client)",
      "CREATE INDEX idx_programmes_status ON programmes (status)",
    ]);

    const programmes = app.findCollectionByNameOrId("programmes");

    // 4. Opportunities — owned by client; converts into a quotation.
    make("opportunities", [
      rel("client", clients, true),
      { name: "title", type: "text", required: true, max: 200 },
      { name: "value", type: "number", min: 0 },
      {
        name: "stage",
        type: "select",
        maxSelect: 1,
        values: ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"],
      },
      { name: "probability", type: "number", min: 0, max: 100 },
      { name: "expectedClose", type: "date" },
      { name: "owner", type: "text", max: 100 },
      { name: "source", type: "text", max: 60 },
      { name: "programmeCode", type: "text", max: 50 },
      rel("linkedProgramme", programmes, false),
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_opportunities_client ON opportunities (client)"]);

    const opportunities = app.findCollectionByNameOrId("opportunities");

    // 5. Quotations — owned by client; linked to programme + originating opportunity.
    make("quotations", [
      rel("client", clients, true),
      rel("programme", programmes, false),
      rel("opportunity", opportunities, false),
      { name: "quoteNo", type: "text", required: true, max: 50 },
      { name: "programmeTitle", type: "text", max: 200 },
      { name: "programmeCode", type: "text", max: 50 },
      { name: "amount", type: "number", min: 0 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
      },
      { name: "issueDate", type: "date" },
      { name: "validUntil", type: "date" },
      { name: "preparedBy", type: "text", max: 100 },
      rel("createdBy", users, true),
    ], [
      "CREATE INDEX idx_quotations_client ON quotations (client)",
      "CREATE INDEX idx_quotations_programme ON quotations (programme)",
    ]);

    const quotationsCol = app.findCollectionByNameOrId("quotations");

    // 6. Purchase orders — converts into a programme; linked to quotation.
    make("purchase_orders", [
      rel("client", clients, true),
      rel("programme", programmes, false),
      rel("quotation", quotationsCol, false),
      { name: "poNo", type: "text", required: true, max: 50 },
      { name: "amount", type: "number", min: 0 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Pending", "Confirmed", "Closed", "On Hold"],
      },
      { name: "issueDate", type: "date" },
      { name: "receivedDate", type: "date" },
      rel("createdBy", users, true),
    ], [
      "CREATE INDEX idx_purchase_orders_client ON purchase_orders (client)",
      "CREATE INDEX idx_purchase_orders_programme ON purchase_orders (programme)",
    ]);

    // 7. Training delivery — many sessions per programme.
    make("training_delivery", [
      rel("programme", programmes, true),
      { name: "title", type: "text", required: true, max: 200 },
      { name: "date", type: "date" },
      { name: "time", type: "text", max: 40 },
      { name: "trainer", type: "text", max: 100 },
      { name: "venue", type: "text", max: 150 },
      {
        name: "mode",
        type: "select",
        maxSelect: 1,
        values: ["In-Person", "Virtual", "Hybrid"],
      },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Scheduled", "Completed", "Cancelled"],
      },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_training_delivery_programme ON training_delivery (programme)"]);

    // 8. Training statistics — aggregated delivery metrics per programme.
    make("training_statistics", [
      rel("programme", programmes, true),
      { name: "sessionsPlanned", type: "number" },
      { name: "sessionsDelivered", type: "number" },
      { name: "attendanceRate", type: "number", min: 0, max: 100 },
      { name: "completionRate", type: "number", min: 0, max: 100 },
      { name: "avgScore", type: "number", min: 0, max: 5 },
      { name: "npsScore", type: "number" },
      { name: "lastSession", type: "date" },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_training_statistics_programme ON training_statistics (programme)"]);

    // 9. Participants — many per programme; linked to client.
    make("participants", [
      rel("programme", programmes, true),
      rel("client", clients, false),
      { name: "name", type: "text", required: true, max: 150 },
      { name: "email", type: "email" },
      { name: "company", type: "text", max: 150 },
      { name: "phone", type: "text", max: 40 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Confirmed", "Attending", "Waitlisted", "Completed", "Withdrawn"],
      },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_participants_programme ON participants (programme)"]);

    // 10. Invoices — produced by a programme; linked to client.
    make("invoices", [
      rel("programme", programmes, true),
      rel("client", clients, true),
      { name: "invoiceNo", type: "text", required: true, max: 50 },
      { name: "description", type: "text", max: 300 },
      { name: "amount", type: "number", min: 0 },
      { name: "paidAmount", type: "number", min: 0 },
      { name: "issueDate", type: "date" },
      { name: "dueDate", type: "date" },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Unpaid", "Paid", "Overdue", "Partial"],
      },
      rel("createdBy", users, true),
    ], [
      "CREATE INDEX idx_invoices_programme ON invoices (programme)",
      "CREATE INDEX idx_invoices_client ON invoices (client)",
    ]);

    const invoicesCol = app.findCollectionByNameOrId("invoices");

    // 11. Payments — collected against an invoice; linked to programme + client.
    make("payments", [
      rel("invoice", invoicesCol, false),
      rel("programme", programmes, true),
      rel("client", clients, true),
      { name: "paymentNo", type: "text", required: true, max: 50 },
      { name: "amount", type: "number", min: 0 },
      {
        name: "method",
        type: "select",
        maxSelect: 1,
        values: ["Bank Transfer", "Cheque", "Online Banking", "Credit Card"],
      },
      { name: "date", type: "date" },
      { name: "reference", type: "text", max: 60 },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Completed", "Pending", "Failed"],
      },
      rel("createdBy", users, true),
    ], [
      "CREATE INDEX idx_payments_programme ON payments (programme)",
      "CREATE INDEX idx_payments_invoice ON payments (invoice)",
    ]);

    // 12. Action items — many per programme (optional link).
    make("action_items", [
      rel("programme", programmes, false),
      { name: "title", type: "text", required: true, max: 200 },
      { name: "relatedTo", type: "text", max: 150 },
      { name: "owner", type: "text", max: 100 },
      { name: "dueDate", type: "date" },
      {
        name: "priority",
        type: "select",
        maxSelect: 1,
        values: ["Low", "Medium", "High"],
      },
      {
        name: "status",
        type: "select",
        maxSelect: 1,
        values: ["Open", "In Progress", "Completed"],
      },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_action_items_programme ON action_items (programme)"]);

    // 13. Documents — many per programme (contracts, courseware, attendance).
    make("documents", [
      rel("programme", programmes, true),
      { name: "name", type: "text", required: true, max: 200 },
      { name: "type", type: "text", max: 60 },
      { name: "uploadedBy", type: "text", max: 100 },
      { name: "date", type: "date" },
      { name: "size", type: "text", max: 20 },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_documents_programme ON documents (programme)"]);

    // 14. Audit history — append-only event log per programme (optional link).
    make("audit_history", [
      rel("programme", programmes, false),
      { name: "action", type: "text", required: true, max: 40 },
      { name: "entity", type: "text", max: 60 },
      { name: "description", type: "text", max: 300 },
      { name: "user", type: "text", max: 100 },
      { name: "timestamp", type: "date" },
      rel("createdBy", users, true),
    ], ["CREATE INDEX idx_audit_history_programme ON audit_history (programme)"]);
  },
  (app) => {
    const names = [
      "audit_history",
      "documents",
      "action_items",
      "payments",
      "invoices",
      "participants",
      "training_statistics",
      "training_delivery",
      "purchase_orders",
      "quotations",
      "opportunities",
      "programmes",
      "client_contacts",
      "clients",
    ];
    names.forEach((n) => {
      try {
        app.delete(app.findCollectionByNameOrId(n));
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    });
  },
);
