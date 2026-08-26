/// <reference path="../pb_data/types.d.ts" />

// Prevent authenticated clients from impersonating another user through
// the createdBy relation. Collection rules protect access; this migration
// protects the integrity of the creator identity on create/update.

const COLLECTIONS = [
  "clients",
  "client_contacts",
  "programmes",
  "opportunities",
  "quotations",
  "purchase_orders",
  "training_delivery",
  "training_statistics",
  "participants",
  "invoices",
  "payments",
  "action_items",
  "documents",
  "audit_history",
];

migrate(
  (app) => {
    for (const name of COLLECTIONS) {
      const col = app.findCollectionByNameOrId(name);
      const previousCreate = col.createRule;
      const previousUpdate = col.updateRule;

      // Preserve the existing role authorization and add creator binding.
      col.createRule = `(${previousCreate || "false"}) && @request.data.createdBy = @request.auth.id`;
      col.updateRule = `(${previousUpdate || "false"}) && @request.data.createdBy = createdBy`;
      app.save(col);
    }
  },
  (app) => {
    // Restore role-only rules. The original authorization migration remains
    // the source of truth when migrations are rolled back in order.
    const role = (roles) => roles.map((r) => `@request.auth.role = "${r}"`).join(" || ");
    const any = role(["super_admin", "manager", "finance", "sales", "programme_pic", "trainer", "viewer"]);
    const sales = role(["super_admin", "manager", "sales"]);
    const salesFinance = role(["super_admin", "manager", "sales", "finance"]);
    const clientTeam = role(["super_admin", "manager", "sales", "finance", "programme_pic"]);
    const programmeReaders = role(["super_admin", "manager", "finance", "sales", "programme_pic", "trainer", "viewer"]);
    const deliveryTeam = role(["super_admin", "manager", "programme_pic", "trainer"]);
    const finance = role(["super_admin", "manager", "finance"]);
    const management = role(["super_admin", "manager"]);
    const rules = {
      clients: [clientTeam, clientTeam, clientTeam, management],
      client_contacts: [clientTeam, clientTeam, clientTeam, management],
      programmes: [programmeReaders, programmeReaders, management, management],
      opportunities: [sales, sales, sales, management],
      quotations: [salesFinance, salesFinance, salesFinance, management],
      purchase_orders: [salesFinance, salesFinance, salesFinance, management],
      training_delivery: [deliveryTeam, deliveryTeam, deliveryTeam, management],
      training_statistics: [programmeReaders, programmeReaders, deliveryTeam, management],
      participants: [deliveryTeam, deliveryTeam, deliveryTeam, management],
      invoices: [finance, finance, finance, management],
      payments: [finance, finance, finance, management],
      action_items: [any, any, any, management],
      documents: [deliveryTeam, deliveryTeam, deliveryTeam, management],
      audit_history: [any, any, null, null],
    };
    for (const [name, [listRule, viewRule, createRule, deleteRule]] of Object.entries(rules)) {
      const col = app.findCollectionByNameOrId(name);
      col.listRule = listRule;
      col.viewRule = viewRule;
      col.createRule = createRule;
      col.updateRule = name === "audit_history" ? null : viewRule;
      col.deleteRule = deleteRule;
      app.save(col);
    }
  },
);
