/// <reference path="../pb_data/types.d.ts" />

const STAFF_PASSWORD = $os.getenv("PB_STAFF_DEFAULT_PASSWORD");

const STAFF = [
  { email: "superadmin@mimos.academy", name: "Aisha Rahman", role: "super_admin" },
  { email: "manager@mimos.academy", name: "Daniel Lim", role: "manager" },
  { email: "finance@mimos.academy", name: "Priya Nair", role: "finance" },
  { email: "sales@mimos.academy", name: "Ahmad Faizal", role: "sales" },
  { email: "pic@mimos.academy", name: "Sarah Tan", role: "programme_pic" },
  { email: "trainer@mimos.academy", name: "Dr. Kumar Selvam", role: "trainer" },
  { email: "viewer@mimos.academy", name: "Michelle Wong", role: "viewer" },
];

migrate(
  (app) => {
    if (!STAFF_PASSWORD) {
      throw new Error("PB_STAFF_DEFAULT_PASSWORD must be set before applying the staff provisioning migration.");
    }

    const users = app.findCollectionByNameOrId("users");

    if (!users.fields.getByName("role")) {
      users.fields.add(
        new SelectField({
          name: "role",
          required: true,
          maxSelect: 1,
          values: ["super_admin", "manager", "finance", "sales", "programme_pic", "trainer", "viewer"],
        }),
      );
    }

    const pw = users.fields.getByName("password");
    pw.min = Math.max(pw.min || 0, 10);

    // Internal staff app — closed sign-up; accounts are provisioned by administrators.
    users.createRule = null;

    app.save(users);

    for (const u of STAFF) {
      let existing = null;
      try {
        existing = app.findAuthRecordByEmail("users", u.email);
      } catch (_) {
        existing = null;
      }
      if (existing) continue;

      const r = new Record(users);
      r.setEmail(u.email);
      r.setPassword(STAFF_PASSWORD);
      r.set("name", u.name);
      r.set("role", u.role);
      r.set("verified", true);
      app.save(r);
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    for (const u of STAFF) {
      try {
        const r = app.findAuthRecordByEmail("users", u.email);
        app.delete(r);
      } catch (e) {
        if (e.message.includes("no rows in result set")) continue;
        throw e;
      }
    }
    users.fields.removeByName("role");
    app.save(users);
  },
);
