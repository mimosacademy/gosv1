/// <reference path="../pb_data/types.d.ts" />

// Refine enterprise collections with the exact fields requested for the
// real MIMOS Academy business data model. Only ADDS new fields to existing
// collections — no existing field is removed or retyped, so data is preserved.

migrate(
  (app) => {
    const addFields = (collectionName, fields) => {
      const col = app.findCollectionByNameOrId(collectionName);
      for (const f of fields) {
        if (!col.fields.getByName(f.name)) {
          col.fields.add(new Field(f));
        }
      }
      app.save(col);
    };

    // Programmes — training type, category, account manager, full SST/collection financials.
    addFields("programmes", [
      { name: "trainingType", type: "text", max: 60 },
      { name: "programmeCategory", type: "select", maxSelect: 1, values: ["In-House", "Public", "Workshop"] },
      { name: "accountManager", type: "text", max: 100 },
      { name: "durationDays", type: "number", onlyInt: true },
      { name: "totalRevenueExclSST", type: "number", min: 0 },
      { name: "sstAmount", type: "number", min: 0 },
      { name: "totalRevenueInclSST", type: "number", min: 0 },
      { name: "totalCollection", type: "number", min: 0 },
      { name: "outstandingAmount", type: "number", min: 0 },
      { name: "poNo", type: "text", max: 60 },
    ]);

    // Quotations — revision, type, SST breakdown, discount, final price, AM/PIC.
    addFields("quotations", [
      { name: "revision", type: "text", max: 20 },
      { name: "quotationType", type: "select", maxSelect: 1, values: ["Training", "Space Rental", "Consultancy", "Service"] },
      { name: "trainingType", type: "text", max: 60 },
      { name: "accountManager", type: "text", max: 100 },
      { name: "pic", type: "text", max: 100 },
      { name: "unitPriceExclSST", type: "number", min: 0 },
      { name: "unitPriceInclSST", type: "number", min: 0 },
      { name: "totalPriceExclSST", type: "number", min: 0 },
      { name: "totalPriceInclSST", type: "number", min: 0 },
      { name: "sstAmount", type: "number", min: 0 },
      { name: "discountPercentage", type: "number", min: 0, max: 100 },
      { name: "finalPrice", type: "number", min: 0 },
    ]);

    // Invoices — SST breakdown, collection/outstanding, payment status/method/date, days outstanding, refs.
    addFields("invoices", [
      { name: "amountExcludingSST", type: "number", min: 0 },
      { name: "sstAmount", type: "number", min: 0 },
      { name: "totalAmount", type: "number", min: 0 },
      { name: "collectionAmount", type: "number", min: 0 },
      { name: "outstandingAmount", type: "number", min: 0 },
      { name: "paymentStatus", type: "select", maxSelect: 1, values: ["PAID", "UNPAID"] },
      { name: "paymentMethod", type: "select", maxSelect: 1, values: ["HRDCorp Claimable", "Self-Pay", "ePerolehan"] },
      { name: "paymentDate", type: "date" },
      { name: "daysOutstanding", type: "number", onlyInt: true },
      { name: "quotationReference", type: "text", max: 80 },
      { name: "poReference", type: "text", max: 80 },
      { name: "accountManager", type: "text", max: 100 },
      { name: "pic", type: "text", max: 100 },
    ]);

    // Opportunities — real forecast pipeline statuses, weighted forecast, sector, AM/salesman.
    addFields("opportunities", [
      { name: "opportunityStatus", type: "select", maxSelect: 1, values: [
        "Contract signed/PO issued",
        "Proposal/Tender submitted",
        "Negotiation stage",
        "Verbal commitment",
        "Early engagement",
        "Qualified lead/Tender in progress",
        "Lost/No-go",
      ] },
      { name: "forecastValue", type: "number", min: 0 },
      { name: "weightedForecast", type: "number", min: 0 },
      { name: "securedOrderBookValue", type: "number", min: 0 },
      { name: "sector", type: "select", maxSelect: 1, values: ["Government", "Private"] },
      { name: "accountManager", type: "text", max: 100 },
      { name: "salesman", type: "text", max: 100 },
      { name: "year", type: "number", onlyInt: true },
    ]);

    // Action items — client, service, person in charge/email, potential revenue, aging, notes.
    addFields("action_items", [
      { name: "client", type: "text", max: 150 },
      { name: "service", type: "text", max: 80 },
      { name: "personInCharge", type: "text", max: 100 },
      { name: "personEmail", type: "email" },
      { name: "potentialRevenue", type: "number", min: 0 },
      { name: "agingDays", type: "number", onlyInt: true },
      { name: "notes", type: "text", max: 500 },
    ]);

    // Training statistics — training date/name/category/domain, counts, charges + SST.
    addFields("training_statistics", [
      { name: "trainingDate", type: "date" },
      { name: "trainingName", type: "text", max: 200 },
      { name: "trainingCategory", type: "text", max: 60 },
      { name: "domain", type: "text", max: 60 },
      { name: "workshopCount", type: "number", onlyInt: true },
      { name: "trainingCount", type: "number", onlyInt: true },
      { name: "totalCount", type: "number", onlyInt: true },
      { name: "bumiputeraCount", type: "number", onlyInt: true },
      { name: "nonBumiputeraCount", type: "number", onlyInt: true },
      { name: "totalCharges", type: "number", min: 0 },
      { name: "sstAmount", type: "number", min: 0 },
      { name: "finalCharges", type: "number", min: 0 },
    ]);
  },
  (app) => {
    const removeFields = (collectionName, fieldNames) => {
      try {
        const col = app.findCollectionByNameOrId(collectionName);
        fieldNames.forEach((n) => {
          if (col.fields.getByName(n)) col.fields.removeByName(n);
        });
        app.save(col);
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    };

    removeFields("programmes", ["trainingType", "programmeCategory", "accountManager", "durationDays", "totalRevenueExclSST", "sstAmount", "totalRevenueInclSST", "totalCollection", "outstandingAmount", "poNo"]);
    removeFields("quotations", ["revision", "quotationType", "trainingType", "accountManager", "pic", "unitPriceExclSST", "unitPriceInclSST", "totalPriceExclSST", "totalPriceInclSST", "sstAmount", "discountPercentage", "finalPrice"]);
    removeFields("invoices", ["amountExcludingSST", "sstAmount", "totalAmount", "collectionAmount", "outstandingAmount", "paymentStatus", "paymentMethod", "paymentDate", "daysOutstanding", "quotationReference", "poReference", "accountManager", "pic"]);
    removeFields("opportunities", ["opportunityStatus", "forecastValue", "weightedForecast", "securedOrderBookValue", "sector", "accountManager", "salesman", "year"]);
    removeFields("action_items", ["client", "service", "personInCharge", "personEmail", "potentialRevenue", "agingDays", "notes"]);
    removeFields("training_statistics", ["trainingDate", "trainingName", "trainingCategory", "domain", "workshopCount", "trainingCount", "totalCount", "bumiputeraCount", "nonBumiputeraCount", "totalCharges", "sstAmount", "finalCharges"]);
  },
);
