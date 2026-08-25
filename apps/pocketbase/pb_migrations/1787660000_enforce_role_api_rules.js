/// <reference path="../pb_data/types.d.ts" />

// Server-side authorization. Frontend route guards are UX only and are not a security boundary.
// Rules mirror the application's role model while keeping shared programme data available to
// authenticated staff where the UI exposes it.

const role = (roles) => roles.map((r) => `@request.auth.role = "${r}"`).join(" || ");
const any = role(["super_admin", "manager", "finance", "sales", "programme_pic", "trainer", "viewer"]);
const management = role(["super_admin", "manager"]);
const sales = role(["super_admin", "manager", "sales"]);
const salesFinance = role(["super_admin", "manager", "sales", "finance"]);
const clientTeam = role(["super_admin", "manager", "sales", "finance", "programme_pic"]);
const programmeReaders = role(["super_admin", "manager", "finance", "sales", "programme_pic", "trainer", "viewer"]);
const deliveryTeam = role(["super_admin", "manager", "programme_pic", "trainer"]);
const finance = role(["super_admin", "manager", "finance"]);

const setRules = (app, name, listRule, viewRule, createRule, updateRule, deleteRule) => {
  const col = app.findCollectionByNameOrId(name);
  col.listRule = listRule;
  col.viewRule = viewRule;
  col.createRule = createRule;
  col.updateRule = updateRule;
  col.deleteRule = deleteRule;
  app.save(col);
};

migrate(
  (app) => {
    // Users: no public account creation. Authentication remains available through PocketBase.
    const users = app.findCollectionByNameOrId("users");
    users.listRule = management;
    users.viewRule = any;
    users.createRule = null;
    users.updateRule = management;
    users.deleteRule = management;
    app.save(users);

    // Pipeline.
    setRules(app, "opportunities", sales, sales, sales, sales, management);
    setRules(app, "quotations", salesFinance, salesFinance, salesFinance, salesFinance, management);
    setRules(app, "purchase_orders", salesFinance, salesFinance, salesFinance, salesFinance, management);

    // Programme master data: all staff can read; operational roles can write.
    setRules(app, "programmes", programmeReaders, programmeReaders, management, management, management);
    setRules(app, "clients", clientTeam, clientTeam, clientTeam, clientTeam, management);
    setRules(app, "client_contacts", clientTeam, clientTeam, clientTeam, clientTeam, management);

    // Training delivery and participants.
    setRules(app, "training_delivery", deliveryTeam, deliveryTeam, deliveryTeam, deliveryTeam, management);
    setRules(app, "training_statistics", programmeReaders, programmeReaders, deliveryTeam, deliveryTeam, management);
    setRules(app, "participants", deliveryTeam, deliveryTeam, deliveryTeam, deliveryTeam, management);

    // Finance.
    setRules(app, "invoices", finance, finance, finance, finance, management);
    setRules(app, "payments", finance, finance, finance, finance, management);

    // Workspace.
    setRules(app, "action_items", any, any, any, any, management);
    setRules(app, "documents", deliveryTeam, deliveryTeam, deliveryTeam, deliveryTeam, management);
    setRules(app, "audit_history", any, any, null, null, null);
  },
  (app) => {
    // Restore the original authenticated-staff policy if this migration is rolled back.
    const R = "@request.auth.id != ''";
    const names = [
      "users", "opportunities", "quotations", "purchase_orders", "programmes", "clients",
      "client_contacts", "training_delivery", "training_statistics", "participants", "invoices",
      "payments", "action_items", "documents", "audit_history",
    ];
    for (const name of names) {
      const col = app.findCollectionByNameOrId(name);
      col.listRule = R;
      col.viewRule = R;
      if (name === "users") {
        col.createRule = null;
      } else {
        col.createRule = R;
      }
      col.updateRule = name === "audit_history" ? null : R;
      col.deleteRule = name === "audit_history" ? null : R;
      app.save(col);
    }
  },
);
