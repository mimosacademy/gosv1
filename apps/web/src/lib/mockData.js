// Real MIMOS Academy business data sourced from the attached PDFs.
// Business flow: Opportunity → Quotation → Purchase Order → Programme
// → Training Delivery → Invoice → Payment Collection.
// "Now" is anchored to late August 2026.

export const formatRM = (n) => `RM ${Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatRMCompact = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1_000_000) return `RM ${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `RM ${(v / 1_000).toFixed(1)}K`;
  return formatRM(v);
};

export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const TODAY = new Date('2026-08-25T09:00:00');

export const isOverdue = (dueDate, status) =>
  !!dueDate && new Date(dueDate) < TODAY && !['Completed', 'Done', 'PAID', 'Paid'].includes(status);

// ---------------------------------------------------------------- Clients
// Real client names from the PDFs. industry/contact derived from the
// account manager (real PIC) and sector where stated; email/phone are not
// published in the source documents and are left blank rather than invented.

export const clients = [
  { id: 'c1', name: 'MIMOS Berhad', industry: 'Technology', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2025' },
  { id: 'c2', name: 'FGV R&D Sdn Bhd', industry: 'R&D', contactPerson: 'Farrah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c3', name: 'NUMIX Engineering Sdn Bhd', industry: 'Engineering', contactPerson: 'Farrah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c4', name: 'Efficient Frontier Consulting', industry: 'Consulting', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2025' },
  { id: 'c5', name: 'University College TATI', industry: 'Education', contactPerson: 'Farrah', email: '', phone: '', location: 'Terengganu', status: 'Active', since: '2026' },
  { id: 'c6', name: 'SIRIM Academy', industry: 'Education', contactPerson: 'Farrah', email: '', phone: '', location: 'Shah Alam', status: 'Active', since: '2026' },
  { id: 'c7', name: 'Pahang Skills Development Center', industry: 'Education', contactPerson: 'Adilah', email: '', phone: '', location: 'Pahang', status: 'Active', since: '2026' },
  { id: 'c8', name: 'UniKL MIDI', industry: 'Education', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c9', name: 'MIMOS Services Sdn Bhd', industry: 'Technology', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c10', name: 'Interscience Sdn Bhd', industry: 'Trading', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c11', name: 'Exzellent Profis Sdn Bhd', industry: 'Training', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c12', name: 'PPKS Ilmu Sdn Bhd', industry: 'Education', contactPerson: 'Farrah', email: '', phone: '', location: 'Sarawak', status: 'Active', since: '2025' },
  { id: 'c13', name: 'Perbadanan Usahawan Nasional Berhad (PUNB)', industry: 'Government', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c14', name: 'MINDEF', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c15', name: 'UniKL BMI', industry: 'Education', contactPerson: 'Adilah', email: '', phone: '', location: 'Gombak', status: 'Active', since: '2026' },
  { id: 'c16', name: 'MIMOS Solutions Sdn Bhd', industry: 'Technology', contactPerson: 'Adilah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c17', name: 'Wice Solution', industry: 'IT Services', contactPerson: 'Abu Said', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c18', name: 'Knowledgecom', industry: 'Training', contactPerson: 'Abu Said', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2025' },
  { id: 'c19', name: 'KESUMA', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Putrajaya', status: 'Active', since: '2026' },
  { id: 'c20', name: 'KETENGAH', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Terengganu', status: 'Active', since: '2026' },
  { id: 'c21', name: 'Kementerian Sumber Manusia', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Putrajaya', status: 'Active', since: '2026' },
  { id: 'c22', name: 'UPM', industry: 'Education', contactPerson: 'Adilah', email: '', phone: '', location: 'Serdang', status: 'Active', since: '2026' },
  { id: 'c23', name: 'Kementerian Digital', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Putrajaya', status: 'Active', since: '2026' },
  { id: 'c24', name: 'JMTI', industry: 'Government', contactPerson: 'Fuziah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c25', name: 'KBS', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Putrajaya', status: 'Active', since: '2026' },
  { id: 'c26', name: 'INSKEN', industry: 'Government', contactPerson: 'Omar', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c27', name: 'CPS-MIMOS', industry: 'Government', contactPerson: 'Zalina', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c28', name: 'ROSCIL SYSTEMS', industry: 'Private', contactPerson: 'Omar', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c29', name: 'Dr. Hamidah', industry: 'Individual', contactPerson: 'Dr. Hamidah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c30', name: 'DENSO', industry: 'Manufacturing', contactPerson: 'Adilah', email: '', phone: '', location: 'Selangor', status: 'Active', since: '2026' },
  { id: 'c31', name: 'Institut Aminuddin Babi (IAB)', industry: 'Education', contactPerson: 'Farrah', email: '', phone: '', location: 'Perak', status: 'Active', since: '2026' },
  { id: 'c32', name: 'UZMA Berhad', industry: 'Oil & Gas', contactPerson: 'Farrah', email: '', phone: '', location: 'Kuala Lumpur', status: 'Active', since: '2026' },
  { id: 'c33', name: 'MARA HQ', industry: 'Government', contactPerson: 'Adila', email: '', phone: '', location: 'Kuala Lumpur', status: 'Prospect', since: '2026' },
  { id: 'c34', name: 'TNB ILSAS', industry: 'Energy', contactPerson: 'Farrah', email: '', phone: '', location: 'Bangi', status: 'Prospect', since: '2026' },
  { id: 'c35', name: 'MCMC Academy', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Cyberjaya', status: 'Prospect', since: '2026' },
  { id: 'c36', name: 'NAIO', industry: 'Government', contactPerson: 'Omar', email: '', phone: '', location: 'Putrajaya', status: 'Prospect', since: '2026' },
  { id: 'c37', name: 'INTAN', industry: 'Government', contactPerson: 'Farrah', email: '', phone: '', location: 'Bukit Kiara', status: 'Prospect', since: '2026' },
  { id: 'c38', name: 'Jabatan Pendaftaran Negara (JPN)', industry: 'Government', contactPerson: 'Omar', email: '', phone: '', location: 'Putrajaya', status: 'Prospect', since: '2026' },
  { id: 'c39', name: 'Yayasan Peneraju', industry: 'Foundation', contactPerson: 'Qusairy', email: '', phone: '', location: 'Kuala Lumpur', status: 'Prospect', since: '2026' },
  { id: 'c40', name: 'Bank Rakyat', industry: 'Banking', contactPerson: 'Omar', email: '', phone: '', location: 'Kuala Lumpur', status: 'Prospect', since: '2026' },
];

export const clientName = (id) => clients.find((c) => c.id === id)?.name ?? id;
const clientIdByName = (name) => clients.find((c) => c.name === name)?.id ?? null;

// ----------------------------------------------- Master training records
// One row per delivered training / engagement from the source financial
// sheets. All values are taken verbatim from the PDFs (invoice value excl
// tax, 8% SST, total incl SST, collection, dates, account manager, PIC).

const records = [
  { client: 'MIMOS Berhad', title: 'Training - AI Prompt Skills: Best Practices for Organization Productivity (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-01-06', endDate: '2026-01-06', quoteNo: 'MA/QT/2026(0001)', poNo: '', poValue: 8500, invoiceNo: '95000016/2026', invoiceValue: 8500, sst: 680, totalInclSST: 9180, collection: 8500, invoiceDate: '2026-03-27', dueDate: '2026-04-26', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-04-06', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'FGV R&D Sdn Bhd', title: 'Training - AI System Thinking (Public)', trainingType: 'Training-AI', programmeCategory: 'Public', startDate: '2026-01-28', endDate: '2026-01-29', quoteNo: 'MASB/QT/TRA/2026/0038', poNo: '', poValue: 1842.59, invoiceNo: '95000015/2026', invoiceValue: 1842.59, sst: 147.41, totalInclSST: 1990, collection: 1842.59, invoiceDate: '2026-03-27', dueDate: '2026-04-26', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-04-09', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Farrah', pic: 'Adilah' },
  { client: 'NUMIX Engineering Sdn Bhd', title: 'Training - AI System Thinking (Public)', trainingType: 'Training-AI', programmeCategory: 'Public', startDate: '2026-01-28', endDate: '2026-01-29', quoteNo: 'MASB/QT/TRA/2026/0042', poNo: '', poValue: 7370.37, invoiceNo: '95000017/2026', invoiceValue: 7370.37, sst: 589.63, totalInclSST: 7960, collection: 7370.37, invoiceDate: '2026-03-27', dueDate: '2026-04-26', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-04-13', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Farrah', pic: 'Adilah' },
  { client: 'Efficient Frontier Consulting', title: 'Space Rental - Auditorium', trainingType: 'Rental-Space', programmeCategory: 'Workshop', startDate: '2026-02-14', endDate: '2026-02-14', quoteNo: 'MASB/QT/TRA/2026/0037', poNo: '', poValue: 2000, invoiceNo: '95000063/2026', invoiceValue: 2000, sst: 0, totalInclSST: 2000, collection: 2000, invoiceDate: '2026-02-09', dueDate: '2026-03-11', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-01-31', account: 'MIMOS', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'University College TATI', title: 'Training - AI System Thinking (Public)', trainingType: 'Training-AI', programmeCategory: 'Public', startDate: '2026-02-09', endDate: '2026-02-10', quoteNo: 'MASB/QT/TRA/2026/0066', poNo: '', poValue: 4166.67, invoiceNo: '95000019/2026', invoiceValue: 4166.67, sst: 333.33, totalInclSST: 4500, collection: 0, invoiceDate: '2026-03-27', dueDate: '2026-04-26', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Omar' },
  { client: 'MIMOS Berhad', title: 'Training - Applied AI for Office Productivity & Workflow Efficiency (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-03-05', endDate: '2026-03-05', quoteNo: 'MASB/QT/TRA/2026/0040', poNo: '', poValue: 9722.22, invoiceNo: '95000047/2026', invoiceValue: 9722.22, sst: 777.78, totalInclSST: 10500, collection: 9722.22, invoiceDate: '2026-05-15', dueDate: '2026-06-14', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-06-02', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'SIRIM Academy', title: 'Training - Overview of Semiconductor Industry (In-House)', trainingType: 'Training-Semiconductor', programmeCategory: 'In-House', startDate: '2026-03-05', endDate: '2026-03-06', quoteNo: 'MASB/QT/TRA/2026/0011rev1', poNo: '', poValue: 19443.52, invoiceNo: '95000024/2026', invoiceValue: 19443.52, sst: 1555.48, totalInclSST: 20999, collection: 0, invoiceDate: '2026-04-06', dueDate: '2026-05-06', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Adilah' },
  { client: 'Pahang Skills Development Center', title: 'Training - AI Training for PLC Students (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-03-10', endDate: '2026-03-11', quoteNo: 'MASB/QT/TRA/2026/0075', poNo: '', poValue: 8000, invoiceNo: '95000025/2026', invoiceValue: 8000, sst: 640, totalInclSST: 8640, collection: 0, invoiceDate: '2026-04-06', dueDate: '2026-05-06', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'UniKL MIDI', title: 'Workshop - Industrial Design (In-House)', trainingType: 'Training-R&D', programmeCategory: 'Workshop', startDate: '2026-04-06', endDate: '2026-04-06', quoteNo: 'MASB/QT/TRA/2026/0077rev2', poNo: '', poValue: 1360, invoiceNo: '95000026/2026', invoiceValue: 1360, sst: 108.8, totalInclSST: 1468.8, collection: 0, invoiceDate: '2026-04-13', dueDate: '2026-05-13', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'MIMOS Services Sdn Bhd', title: 'Training - Leadership & Shared Vision: Aligning People, Purpose & Performance (In-House)', trainingType: 'Training-GTM', programmeCategory: 'In-House', startDate: '2026-04-02', endDate: '2026-04-03', quoteNo: 'MASB/QT/TRA/2026/0036rev2', poNo: '', poValue: 19444.44, invoiceNo: '95000251/2026', invoiceValue: 19444.44, sst: 1555.56, totalInclSST: 21000, collection: 19444.44, invoiceDate: '2026-04-23', dueDate: '2026-05-23', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-05-20', account: 'MIMOS', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'Interscience Sdn Bhd', title: 'Space Rental - Auditorium & 5G Room', trainingType: 'Rental-Space', programmeCategory: 'Workshop', startDate: '2026-04-21', endDate: '2026-04-21', quoteNo: 'MASB/QT/TRA/2026/0072', poNo: '', poValue: 2300, invoiceNo: '95000252/2026', invoiceValue: 2300, sst: 0, totalInclSST: 2300, collection: 0, invoiceDate: '2026-04-29', dueDate: '2026-05-29', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MIMOS', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'MIMOS Services Sdn Bhd', title: 'Training - Leadership & Shared Vision: Aligning People, Purpose & Performance (In-House)', trainingType: 'Training-GTM', programmeCategory: 'In-House', startDate: '2026-04-02', endDate: '2026-04-03', quoteNo: 'MASB/QT/TRA/2026/0036rev2', poNo: '', poValue: 26800, invoiceNo: '13000029/2026', invoiceValue: 26800, sst: 0, totalInclSST: 26800, collection: 0, invoiceDate: '2026-04-30', dueDate: '2026-05-30', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MIMOS', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'Exzellent Profis Sdn Bhd', title: 'Training - Train-The-Trainer: Certified AI Trainer (Public)', trainingType: 'Training-TTT', programmeCategory: 'Public', startDate: '2026-04-20', endDate: '2026-04-24', quoteNo: 'MASB/QT/TRA/2026/0070rev4', poNo: '', poValue: 8101.85, invoiceNo: '95000048/2026', invoiceValue: 8101.85, sst: 648.15, totalInclSST: 8750, collection: 8101.85, invoiceDate: '2026-05-15', dueDate: '2026-06-14', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-06-02', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'Pahang Skills Development Center', title: 'Training - Train-The-Trainer: Certified AI Trainer (Public)', trainingType: 'Training-TTT', programmeCategory: 'Public', startDate: '2026-04-20', endDate: '2026-04-24', quoteNo: 'MASB/QT/TRA/2026/0073', poNo: '', poValue: 14000, invoiceNo: '95000049/2026', invoiceValue: 14000, sst: 1120, totalInclSST: 15120, collection: 14000, invoiceDate: '2026-05-15', dueDate: '2026-06-14', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-06-05', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'UPM', title: 'Training - Ergonomics (In-House)', trainingType: 'Training-R&D', programmeCategory: 'In-House', startDate: '2026-04-29', endDate: '2026-04-29', quoteNo: 'MASB/QT/TRA/2026/0096', poNo: '', poValue: 1085, invoiceNo: '95000039/2026', invoiceValue: 1085, sst: 0, totalInclSST: 1085, collection: 1085, invoiceDate: '2026-04-30', dueDate: '2026-05-30', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-04-28', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'PPKS Ilmu Sdn Bhd', title: 'Training - Train-The-Trainer: Certified AI Trainer (Public)', trainingType: 'Training-TTT', programmeCategory: 'Public', startDate: '2025-12-01', endDate: '2025-12-05', quoteNo: 'Last Year Quo by Farrah', poNo: '', poValue: 6944.44, invoiceNo: '95000040/2026', invoiceValue: 6944.44, sst: 555.56, totalInclSST: 7500, collection: 6944.44, invoiceDate: '2026-04-30', dueDate: '2026-05-30', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-06-08', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Farrah', pic: 'Adilah' },
  { client: 'Perbadanan Usahawan Nasional Berhad (PUNB)', title: 'Training - AI System Thinking (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-05-13', endDate: '2026-05-14', quoteNo: 'MASB/QT/TRA/2026/0076rev2', poNo: '', poValue: 19444.44, invoiceNo: '95000054/2026', invoiceValue: 19444.44, sst: 1555.56, totalInclSST: 21000, collection: 19444.44, invoiceDate: '2026-05-21', dueDate: '2026-06-20', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'PAID', paymentDate: '2026-05-26', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'MINDEF', title: 'Training - Train-The-Trainer: Certified AI Trainer (In-House)', trainingType: 'Training-TTT', programmeCategory: 'In-House', startDate: '2026-05-11', endDate: '2026-05-15', quoteNo: 'MASB/QT/TRA/2026/0032rev2', poNo: '', poValue: 46285, invoiceNo: '95000053/2026', invoiceValue: 46285, sst: 3702.8, totalInclSST: 49987.8, collection: 46285, invoiceDate: '2026-05-21', dueDate: '2026-06-20', paymentMethod: 'ePerolehan', paymentStatus: 'PAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Farrah' },
  { client: 'UniKL BMI', title: 'Workshop - Industrial Semiconductor (In-House) — Cohort 1', trainingType: 'Training-Semiconductor', programmeCategory: 'Workshop', startDate: '2026-05-20', endDate: '2026-05-20', quoteNo: 'MASB/QT/TRA/2026/0078rev2', poNo: '', poValue: 1470, invoiceNo: '95000061/2026', invoiceValue: 1470, sst: 117.6, totalInclSST: 1587.6, collection: 0, invoiceDate: '2026-06-16', dueDate: '2026-07-16', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'UniKL BMI', title: 'Workshop - Industrial Semiconductor (In-House) — Cohort 2', trainingType: 'Training-Semiconductor', programmeCategory: 'Workshop', startDate: '2026-06-03', endDate: '2026-06-03', quoteNo: 'MASB/QT/TRA/2026/0095', poNo: '', poValue: 1470, invoiceNo: '95000062/2026', invoiceValue: 1470, sst: 117.6, totalInclSST: 1587.6, collection: 0, invoiceDate: '2026-06-16', dueDate: '2026-07-16', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'MIMOS Solutions Sdn Bhd', title: 'Training - Leveraging AI to Accelerate End-to-End Tender Preparation and Proposal Development', trainingType: 'Training-Project Mgmt', programmeCategory: 'In-House', startDate: '2026-06-04', endDate: '2026-06-05', quoteNo: 'MASB/QT/TRA/2026/0083rev2', poNo: '', poValue: 19444.44, invoiceNo: '95000078/2026', invoiceValue: 19444.44, sst: 1555.56, totalInclSST: 21000, collection: 0, invoiceDate: '2026-06-30', dueDate: '2026-07-30', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'Wice Solution', title: 'Space Rental', trainingType: 'Rental-Space', programmeCategory: 'Workshop', startDate: '2026-05-13', endDate: '2026-05-13', quoteNo: 'MASB/QT/TRA/2026/0093', poNo: '', poValue: 1625, invoiceNo: '95000036/2026', invoiceValue: 1625, sst: 0, totalInclSST: 1625, collection: 1625, invoiceDate: '2026-04-30', dueDate: '2026-05-30', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-05-11', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Abu Said', pic: 'Abu Said' },
  { client: 'Knowledgecom', title: 'Yayasan Peneraju - Training Promotion', trainingType: 'Training-R&D', programmeCategory: 'In-House', startDate: '2025-01-01', endDate: '2026-12-31', quoteNo: 'N/A Comission base', poNo: '', poValue: 16900.37, invoiceNo: '95000199/2026', invoiceValue: 16900.37, sst: 1352.03, totalInclSST: 18252.4, collection: 16900.37, invoiceDate: '2026-04-23', dueDate: '2026-05-23', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-05-28', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Abu Said', pic: 'Abu Said' },
  { client: 'Efficient Frontier Consulting', title: 'Training - K-Youth Semiconductor Phase 3', trainingType: 'Training-Semiconductor', programmeCategory: 'In-House', startDate: '2025-09-02', endDate: '2025-10-03', quoteNo: '', poNo: '', poValue: 31111, invoiceNo: '95000052/2026', invoiceValue: 31111, sst: 2488.89, totalInclSST: 33600, collection: 31111, invoiceDate: '2026-01-28', dueDate: '2026-02-27', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-03-12', account: 'MIMOS', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'Efficient Frontier Consulting', title: 'Training - K-Youth Semiconductor Phase 1 & 2', trainingType: 'Training-Semiconductor', programmeCategory: 'In-House', startDate: '2025-09-02', endDate: '2025-10-03', quoteNo: 'No quotation - price stated in TOE', poNo: '', poValue: 51851.85, invoiceNo: '95000748/2025', invoiceValue: 51851.85, sst: 4148.15, totalInclSST: 56000, collection: 51851.85, invoiceDate: '2026-12-15', dueDate: '2027-01-14', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-03-12', account: 'MIMOS', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'KETENGAH', title: 'Training - AI System Thinking (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-06-08', endDate: '2026-06-09', quoteNo: 'No quotation - price stated in TOE', poNo: '', poValue: 21000, invoiceNo: '95000060/2026', invoiceValue: 21000, sst: 1680, totalInclSST: 22680, collection: 21000, invoiceDate: '2026-06-15', dueDate: '2026-07-15', paymentMethod: 'ePerolehan', paymentStatus: 'PAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Farrah' },
  { client: 'Kementerian Sumber Manusia', title: 'Training - Vibe Coding', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-05-13', endDate: '2026-06-15', quoteNo: 'MASB/QT/TRA/2026/0035Rev1', poNo: 'PO260000000210123', poValue: 23145.83, invoiceNo: '95000033/2026', invoiceValue: 23145.83, sst: 1851.67, totalInclSST: 24997.5, collection: 23145.83, invoiceDate: '2026-04-27', dueDate: '2026-05-27', paymentMethod: 'ePerolehan', paymentStatus: 'PAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Farrah' },
  { client: 'Kementerian Digital', title: 'Training - PKHD Penyedia Latihan Bagi Kursus Optimum NotebookLM', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-06-25', endDate: '2026-06-26', quoteNo: '', poNo: '', poValue: 25925, invoiceNo: '95000073/2026', invoiceValue: 25925, sst: 2074, totalInclSST: 27999, collection: 0, invoiceDate: '2026-06-26', dueDate: '2026-07-26', paymentMethod: 'ePerolehan', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Farrah' },
  { client: 'JMTI', title: 'Training - Perkhidmatan Penyediaan Kursus Front End Wafer Fabrication - Process & Manufacturing Operation - Level 4', trainingType: 'Training-Semiconductor', programmeCategory: 'In-House', startDate: '2026-06-08', endDate: '2026-06-26', quoteNo: 'MASB/QT/TRA/2026/0119Rev3', poNo: 'PO260000000409368', poValue: 445500, invoiceNo: '95000070/2026', invoiceValue: 445500, sst: 35640, totalInclSST: 481140, collection: 445500, invoiceDate: '2026-06-26', dueDate: '2026-07-26', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-07-13', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Fuziah', pic: 'Fuziah' },
  { client: 'KBS', title: 'Training - Vibe Coding', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-06-15', endDate: '2026-06-16', quoteNo: 'MASB/QT/TRA/2026/0080', poNo: '', poValue: 22037.04, invoiceNo: '95000076/2026', invoiceValue: 22037.04, sst: 1762.96, totalInclSST: 23800, collection: 0, invoiceDate: '2026-07-07', dueDate: '2026-08-06', paymentMethod: 'ePerolehan', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Farrah', pic: 'Farrah' },
  { client: 'INSKEN', title: 'Training - AI System Thinking (In-House)', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-06-09', endDate: '2026-06-10', quoteNo: '', poNo: '', poValue: 25000, invoiceNo: '95000063/2026', invoiceValue: 25000, sst: 2000, totalInclSST: 27000, collection: 25000, invoiceDate: '2026-06-22', dueDate: '2026-07-22', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Omar', pic: 'Omar' },
  { client: 'CPS-MIMOS', title: 'National Dialogue on Trusted Intelligence (Conference)', trainingType: 'Others', programmeCategory: 'Workshop', startDate: '2026-07-08', endDate: '2026-07-08', quoteNo: '', poNo: 'PO4400040551', poValue: 29650, invoiceNo: '13000022/2026', invoiceValue: 29650, sst: 0, totalInclSST: 29650, collection: 0, invoiceDate: '2026-07-15', dueDate: '2026-08-14', paymentMethod: '', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Zalina', pic: 'Zalina' },
  { client: 'CPS-MIMOS', title: 'Workshop on National Dialogue on Trusted Intelligence', trainingType: 'Others', programmeCategory: 'Workshop', startDate: '2026-07-08', endDate: '2026-07-08', quoteNo: '', poNo: 'PO4400040550', poValue: 10650, invoiceNo: '13000023/2026', invoiceValue: 10650, sst: 0, totalInclSST: 10650, collection: 0, invoiceDate: '2026-07-15', dueDate: '2026-08-14', paymentMethod: '', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Zalina', pic: 'Zalina' },
  { client: 'ROSCIL SYSTEMS', title: 'TTT Training', trainingType: 'Training-TTT', programmeCategory: 'Public', startDate: '2026-04-20', endDate: '2026-04-24', quoteNo: '', poNo: '', poValue: 5500, invoiceNo: '', invoiceValue: 5500, sst: 0, totalInclSST: 5500, collection: 5500, invoiceDate: '', dueDate: '', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '2026-03-29', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Omar', pic: 'Omar' },
  { client: 'University College TATI', title: 'TTT Training', trainingType: 'Training-TTT', programmeCategory: 'Public', startDate: '2026-04-20', endDate: '2026-04-24', quoteNo: 'MASB/QT/TRA/2026/0047', poNo: '', poValue: 9259.26, invoiceNo: '95000058/2026', invoiceValue: 9259.26, sst: 740.74, totalInclSST: 10000, collection: 0, invoiceDate: '2026-06-08', dueDate: '2026-07-08', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Omar', pic: 'Omar' },
  { client: 'MIMOS Berhad', title: 'Bulletproof Your Tech Business', trainingType: 'Training-GTM', programmeCategory: 'In-House', startDate: '2026-06-23', endDate: '2026-06-24', quoteNo: 'MASB/QT/TRA/2026/0132', poNo: '', poValue: 19444.44, invoiceNo: '95000081/2026', invoiceValue: 19444.44, sst: 1555.56, totalInclSST: 21000, collection: 0, invoiceDate: '2026-07-15', dueDate: '2026-08-14', paymentMethod: 'HRDCorp Claimable', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Zalina', pic: 'Zalina' },
  { client: 'Dr. Hamidah', title: 'AI Training', trainingType: 'Training-AI', programmeCategory: 'In-House', startDate: '2026-02-08', endDate: '2026-02-09', quoteNo: 'MASB/QT/TRA/2026/0064', poNo: '', poValue: 1388.89, invoiceNo: '95000008/2026', invoiceValue: 1388.89, sst: 111.11, totalInclSST: 1500, collection: 1388.89, invoiceDate: '2026-02-25', dueDate: '2026-03-27', paymentMethod: 'Self-Pay', paymentStatus: 'PAID', paymentDate: '', account: 'MSSB', acctStatus: 'DONE', accountManager: 'Adilah', pic: 'Adilah' },
  { client: 'DENSO', title: 'Semiconductor Training', trainingType: 'Training-Semiconductor', programmeCategory: 'In-House', startDate: '2026-06-29', endDate: '2026-07-08', quoteNo: '', poNo: '', poValue: 51673.23, invoiceNo: '', invoiceValue: 51673.23, sst: 0, totalInclSST: 51673.23, collection: 0, invoiceDate: '', dueDate: '', paymentMethod: 'Self-Pay', paymentStatus: 'UNPAID', paymentDate: '', account: 'MSSB', acctStatus: 'FOLLOW UP', accountManager: 'Adilah', pic: 'Adilah' },
];

const daysBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
};

// ------------------------------------------------------------- Programmes
// Derived from the master records. Programme code = quotation number
// (the real MIMOS identifier). Financials are exact from the PDFs.

export const programmes = records.map((r, i) => {
  const id = `p${i + 1}`;
  const cid = clientIdByName(r.client);
  const completed = r.acctStatus === 'DONE';
  const progress = completed ? 100 : r.endDate && new Date(r.endDate) < TODAY ? 80 : 40;
  const sessionsPlanned = Math.max(1, daysBetween(r.startDate, r.endDate) + 1);
  const sessionsDelivered = completed ? sessionsPlanned : Math.round(sessionsPlanned * (progress / 100));
  return {
    id,
    code: r.quoteNo || `MA/PROG/2026/${String(i + 1).padStart(4, '0')}`,
    title: r.title,
    category: r.trainingType,
    trainingType: r.trainingType,
    programmeCategory: r.programmeCategory,
    client: cid,
    clientName: r.client,
    status: completed ? 'Completed' : new Date(r.startDate) > TODAY ? 'Scheduled' : 'In Progress',
    accountManager: r.accountManager,
    pic: r.pic,
    startDate: r.startDate,
    endDate: r.endDate,
    durationDays: daysBetween(r.startDate, r.endDate) + 1,
    venue: r.programmeCategory === 'Public' ? 'MIMOS KL Campus' : r.programmeCategory === 'Workshop' ? 'MIMOS Auditorium' : 'Client Site',
    participants: 0,
    progress,
    contractValue: r.poValue,
    totalRevenueExclSST: r.invoiceValue,
    sstAmount: r.sst,
    totalRevenueInclSST: r.totalInclSST,
    totalCollection: r.collection,
    outstandingAmount: r.invoiceValue - r.collection,
    quotationId: `q${i + 1}`,
    poId: r.poNo ? `po${i + 1}` : null,
    poNo: r.poNo || '',
    opportunityId: null,
    sessionsPlanned,
    sessionsDelivered,
    account: r.account,
  };
});

const programmeByCode = (code) => programmes.find((p) => p.code === code);

// ------------------------------------------------------------- Quotations
// One quotation per record that has a quotation number. Revision is parsed
// from the "revN" suffix in the real quotation number.

export const quotations = records
  .map((r, i) => {
    if (!r.quoteNo || r.quoteNo.startsWith('No quotation') || r.quoteNo.startsWith('N/A') || r.quoteNo.startsWith('Last Year')) return null;
    const revMatch = r.quoteNo.match(/rev(\d+)/i);
    const prog = programmes[i];
    return {
      id: `q${i + 1}`,
      quoteNo: r.quoteNo,
      revision: revMatch ? `rev${revMatch[1]}` : 'rev1',
      quotationType: r.trainingType.startsWith('Rental') ? 'Space Rental' : 'Training',
      trainingType: r.trainingType,
      client: prog.client,
      clientName: r.client,
      programme: r.title,
      programmeTitle: r.title,
      programmeCode: r.quoteNo,
      programmeId: prog.id,
      amount: r.poValue,
      unitPriceExclSST: r.poValue,
      unitPriceInclSST: r.totalInclSST,
      totalPriceExclSST: r.poValue,
      totalPriceInclSST: r.totalInclSST,
      sstAmount: r.sst,
      discountPercentage: 0,
      finalPrice: r.totalInclSST,
      accountManager: r.accountManager,
      pic: r.pic,
      status: r.acctStatus === 'DONE' ? 'Won' : 'Sent',
      issueDate: r.startDate,
      validUntil: r.startDate ? new Date(new Date(r.startDate).getTime() + 30 * 86400000).toISOString().slice(0, 10) : '',
      preparedBy: r.accountManager,
    };
  })
  .filter(Boolean);

// -------------------------------------------------------- Purchase Orders
// Derived from records that carry a real PO number.

export const purchaseOrders = records
  .map((r, i) => {
    if (!r.poNo) return null;
    const prog = programmes[i];
    return {
      id: `po${i + 1}`,
      poNo: r.poNo,
      client: prog.client,
      clientName: r.client,
      programmeId: prog.id,
      programmeCode: prog.code,
      programmeTitle: r.title,
      quotationId: `q${i + 1}`,
      amount: r.poValue,
      status: r.paymentStatus === 'PAID' ? 'Closed' : 'Confirmed',
      issueDate: r.startDate,
      receivedDate: r.invoiceDate || '',
    };
  })
  .filter(Boolean);

// ---------------------------------------------------------------- Invoices
// One invoice per record that has an invoice number. "Pending @ Fin" rows
// are marked pending. Days outstanding computed from due date to today.

export const invoices = records
  .map((r, i) => {
    if (!r.invoiceNo) return null;
    const prog = programmes[i];
    const quote = quotations.find((q) => q.id === `q${i + 1}`);
    const daysOutstanding = r.dueDate ? Math.max(0, Math.round((TODAY - new Date(r.dueDate)) / 86400000)) : 0;
    return {
      id: `i${i + 1}`,
      invoiceNo: r.invoiceNo,
      invoiceDate: r.invoiceDate,
      dueDate: r.dueDate,
      client: prog.client,
      clientName: r.client,
      programmeId: prog.id,
      programmeCode: prog.code,
      programme: r.title,
      quotationReference: r.quoteNo || '',
      poReference: r.poNo || '',
      description: r.title,
      amountExcludingSST: r.invoiceValue,
      amount: r.invoiceValue,
      sstAmount: r.sst,
      totalAmount: r.totalInclSST,
      collectionAmount: r.collection,
      paidAmount: r.collection,
      outstandingAmount: r.invoiceValue - r.collection,
      status: r.paymentStatus === 'PAID' ? 'Paid' : r.dueDate && new Date(r.dueDate) < TODAY ? 'Overdue' : 'Unpaid',
      paymentStatus: r.paymentStatus,
      paymentMethod: r.paymentMethod,
      paymentDate: r.paymentDate,
      daysOutstanding,
      account: r.account,
      accountManager: r.accountManager,
      pic: r.pic,
    };
  })
  .filter(Boolean);

// ---------------------------------------------------------------- Payments
// One payment per record with PAID status and a collection amount.

export const payments = records
  .map((r, i) => {
    if (r.paymentStatus !== 'PAID' || !r.collection) return null;
    const prog = programmes[i];
    const inv = invoices.find((iv) => iv && iv.invoiceNo === r.invoiceNo);
    return {
      id: `pay${i + 1}`,
      paymentNo: `PAY-2026-${String(i + 1).padStart(4, '0')}`,
      invoiceNo: r.invoiceNo,
      invoice: inv ? inv.id : null,
      client: prog.client,
      clientName: r.client,
      programmeCode: prog.code,
      programmeId: prog.id,
      amount: r.collection,
      method: r.paymentMethod,
      date: r.paymentDate || r.invoiceDate,
      reference: r.poNo || '',
      status: 'Completed',
    };
  })
  .filter(Boolean);

// ----------------------------------------------------------- Opportunities
// Real forecast pipeline from the source forecast sheet. Statuses,
// forecast, weighted, sector and salesman are verbatim from the PDF.

export const FUNNEL_STAGES = [
  { stage: 'Early engagement', probability: 15, color: '#c4b5fd' },
  { stage: 'Qualified lead/Tender in progress', probability: 30, color: '#a78bfa' },
  { stage: 'Proposal/Tender submitted', probability: 50, color: '#8b5cf6' },
  { stage: 'Negotiation stage', probability: 70, color: '#7c3aed' },
  { stage: 'Verbal commitment', probability: 85, color: '#6d28d9' },
  { stage: 'Contract signed/PO issued', probability: 100, color: '#16a34a' },
];

const oppRows = [
  ['Kementerian Sumber Manusia', 'AI Vibe Coding', 24990, 24990, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['KETENGAH', 'In-House AI Training', 22680, 22680, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['KETENGAH', 'In-House AI Training', 252000, 25200, 'Early engagement', 'Government', 'Farrah'],
  ['TNB ILSAS', 'In-House AI Training', 240000, 72000, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['TNB ILSAS', 'In-House AI Training', 82000, 82000, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['TNB ILSAS', 'In-House AI Training', 24000, 12000, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['TNB ILSAS', 'In-House AI Training', 6000, 3000, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['MARA HQ', 'In-House AI Training', 21000, 10500, 'Proposal/Tender submitted', 'Government', 'Adila'],
  ['MSIA PALM OIL GREEN CONSERVATION FOUNDATION', 'In-House AI Training', 21000, 0, 'Lost/No-go', 'Private', 'Omar'],
  ['KPM', 'In-House AI Training', 21000, 6300, 'Qualified lead/Tender in progress', 'Government', 'Farrah'],
  ['PERKESO', 'In-House AI Training', 42000, 4200, 'Early engagement', 'Government', 'Omar'],
  ['KPJ', 'In-House AI Training', 21000, 2100, 'Early engagement', 'Private', 'Omar'],
  ['MRANTI', 'In-House AI Training', 21000, 2100, 'Early engagement', 'Government', 'Omar'],
  ['INSKEN', 'In-House AI Training', 27000, 27000, 'Contract signed/PO issued', 'Government', 'Omar'],
  ['INSKEN', 'AI Training for 2nd batch', 27000, 27000, 'Contract signed/PO issued', 'Government', 'Omar'],
  ['MARA HQ', 'MARA Training Grant for Semiconductor, AI, Big Data, IR4.0', 369000, 369000, 'Contract signed/PO issued', 'Government', 'Adila'],
  ['PTPK / JPK', 'PTPK Training Grant for Semiconductor, AI, Big Data, IR4.0', 700000, 350000, 'Proposal/Tender submitted', 'Government', 'Adila'],
  ['MCMC Academy', 'AI Training for Telcos and Broadcasters', 250000, 175000, 'Negotiation stage', 'Government', 'Farrah'],
  ['MINDEF', 'In-House AI Training Cohort 1', 49990, 49990, 'Contract signed/PO issued', 'Government', 'Adila'],
  ['MINDEF', 'In-House AI Training Cohort 2', 49978, 49978, 'Contract signed/PO issued', 'Government', 'Adila'],
  ['Yayasan Peneraju - Knowledgecom', 'AI, COMTIA, Power BI & Microsoft Certificate', 300000, 0, 'Lost/No-go', 'Private', 'Qusairy'],
  ['MIGHT', 'AI Training', 21000, 10500, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['MIGHT - Members', 'AI Training', 100000, 10000, 'Early engagement', 'Private', 'Farrah'],
  ['Institut Aminuddin Babi', 'KPM TTT AI', 49000, 22950, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['Yayasan Peneraju', 'AI Training', 21000, 6300, 'Proposal/Tender submitted', 'Private', 'Qusairy'],
  ['JPSM Sabah', 'AI, Graduates Program', 271000, 81300, 'Proposal/Tender submitted', 'Government', 'Fuzi'],
  ['INTURA', 'TTT, AI - Penjawat Awam', 73500, 7350, 'Early engagement', 'Government', 'Fuzi'],
  ['KESUMA JPK', 'In-House AI Training', 19500, 17000, 'Negotiation stage', 'Government', 'Farrah'],
  ['KESUMA BPM', 'In-House Vibe Coding (AI)', 24990, 24990, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['Kementerian Belia & Sukan', 'In-house AI training', 34000, 34000, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['MCMC Academy', 'In-House AI Training', 21000, 10500, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['PETRA', 'In-House AI Training', 24000, 7200, 'Negotiation stage', 'Government', 'Farrah'],
  ['PUNB', 'AI Training', 21000, 21000, 'Contract signed/PO issued', 'Government', 'Adila'],
  ['TATI', 'TTT AI', 10000, 8500, 'Contract signed/PO issued', 'Government', 'Omar'],
  ['TATI', 'In-House AI Training', 4500, 0, 'Contract signed/PO issued', 'Government', 'Omar'],
  ['KITAB Penang', 'In-House AI Training', 21000, 17850, 'Verbal commitment', 'Government', 'Fuzi'],
  ['Pahang Skills', 'TTT AI', 15000, 12750, 'Verbal commitment', 'Government', 'Adila'],
  ['DPIM', 'AI Training for Asnaf', 45000, 31500, 'Negotiation stage', 'Private', 'Omar'],
  ['DPIM', 'AI Training for Teachers', 36000, 25200, 'Negotiation stage', 'Private', 'Omar'],
  ['DPIM', 'AI Training for Staff', 36000, 25200, 'Negotiation stage', 'Private', 'Omar'],
  ['Bank Rakyat', 'AI Training', 21000, 10500, 'Proposal/Tender submitted', 'Private', 'Omar'],
  ['MDEC', 'AI Training', 21000, 10500, 'Proposal/Tender submitted', 'Government', 'Omar'],
  ['Pahang Skills', 'AI Training for PLC', 8640, 8640, 'Contract signed/PO issued', 'Government', 'Adila'],
  ['Institut Koperasi Malaysia', 'AI Training', 25000, 12500, 'Proposal/Tender submitted', 'Government', 'Omar'],
  ['UZMA', 'AI Training', 24000, 24000, 'Contract signed/PO issued', 'Private', 'Farrah'],
  ['AI Public Training (Jan26)', 'Public Training', 8970, 8970, 'Contract signed/PO issued', 'Private', 'Farrah'],
  ['AI Public Training (Feb26)', 'Public Training', 16960, 16960, 'Contract signed/PO issued', 'Private', 'Farrah'],
  ['AI Internal Training', 'Internal Training- MIMOS', 9180, 9180, 'Contract signed/PO issued', 'Private', 'Zalina'],
  ['Koperasi Tentera', 'AI Training', 22000, 11000, 'Proposal/Tender submitted', 'Government', 'Omar'],
  ['MIMOS Berhad -Internal AI Training', 'Internal AI Training', 9180, 9180, 'Contract signed/PO issued', 'Private', 'Zalina'],
  ['MOF', 'AI System Thinking', 5000, 5000, 'Contract signed/PO issued', 'Government', 'Zalina'],
  ['Multicompany (Public)', 'AI Certified Trainer & Practitioner', 46500, 46500, 'Contract signed/PO issued', 'Private', 'Farrah'],
  ['MARA TVET', 'AI Literacy (MRSM)', 500000, 150000, 'Qualified lead/Tender in progress', 'Government', 'Adila'],
  ['UNISEL', 'AI System Thinking', 21000, 10500, 'Proposal/Tender submitted', 'Private', 'Omar'],
  ['NAIO', 'AI Public Awareness', 200000, 60000, 'Negotiation stage', 'Government', 'Omar'],
  ['NAIO', 'AI for Educator', 200000, 60000, 'Negotiation stage', 'Government', 'Omar'],
  ['NAIO', 'AI for Apprentice', 200000, 60000, 'Negotiation stage', 'Government', 'Omar'],
  ['NAIO', 'TTT: AI Certified Trainer and Practitioner', 200000, 60000, 'Negotiation stage', 'Government', 'Omar'],
  ['MCMC', 'AI Literacy for MCMC', 150000, 45000, 'Proposal/Tender submitted', 'Government', 'Farrah'],
  ['Jabatan Digital', 'Notebooklm & AI System Thinking', 28000, 28000, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['Kementerian Perdagangan Dalam Negeri & Keterjaminan Makanan', 'AI, Data Analytics & Programming (Beginner)', 48600, 24300, 'Qualified lead/Tender in progress', 'Government', 'Farrah'],
  ['CCSB', 'AI Powered Video Content Creation', 22680, 19278, 'Verbal commitment', 'Private', 'Farrah'],
  ['IAB', 'AI Train Headmaster', 48000, 48000, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['Takaful Ikhlas', 'AI System Thinking', 22680, 19278, 'Verbal commitment', 'Private', 'Omar'],
  ['UNISEL', 'TTT: AI Certified Trainer and Practitioner', 50000, 5000, 'Early engagement', 'Private', 'Omar'],
  ['AIR BORNEO', 'AI System Thinking', 21000, 2100, 'Early engagement', 'Private', 'Omar'],
  ['INOKOM', 'AI System Thinking', 25000, 7500, 'Qualified lead/Tender in progress', 'Private', 'Omar'],
  ['Bank Rakyat', 'AI System Thinking + AI Box', 71000, 21300, 'Proposal/Tender submitted', 'Private', 'Omar'],
  ['Lembaga Tabung Haji', 'AI System Thinking + AI Box', 71000, 21300, 'Negotiation stage', 'Private', 'Omar'],
  ['JMTI', 'TTT- Front End Wafer Fab', 481140, 481140, 'Contract signed/PO issued', 'Government', 'Fuziah'],
  ['JMTI', 'TTT- Front End Wafer Fab (Phase 2)', 481140, 481140, 'Contract signed/PO issued', 'Government', 'Fuziah'],
  ['Efficient Frontier Consulting (Khazanah)', 'Semiconductor', 89600, 89600, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['Aisling Consultancy', 'Semiconductor Manufacturing Process & Analysis', 485000, 485000, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['MARA UNIKL Degree Program', 'Degree Program', 200000, 60000, 'Qualified lead/Tender in progress', 'Government', 'Adila'],
  ['SIRIM Academy', 'AI System Thinking', 160000, 80000, 'Proposal/Tender submitted', 'Government', 'Zalina'],
  ['IKMA', 'TTT: AI Certified Trainer and Practitioner', 40000, 40000, 'Contract signed/PO issued', 'Government', 'Omar'],
  ['KBS', 'AI Vibe Coding', 23829.12, 23829.12, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['Uzma Berhad', 'AI Masterclass for Leaders & Management', 24000, 24000, 'Contract signed/PO issued', 'Private', 'Farrah'],
  ['ROSCIL SYSTEMS', 'Public Training -TTT', 5500, 5500, 'Contract signed/PO issued', 'Private', 'Omar'],
  ['Efficient Frontier Consulting (Khazanah)', 'Khazanah Youth Talent Development Program Training Grant for Semiconductor', 100000, 100000, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['Efficient Frontier Consulting (Khazanah)', 'Rental', 2000, 2000, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['Knowledgecom', 'Yayasan Peneraju - Training Promotion', 18252.4, 18252.4, 'Contract signed/PO issued', 'Private', 'Abu Said'],
  ['Wice Solution', 'Space Rental', 1625, 1625, 'Contract signed/PO issued', 'Private', 'Abu Said'],
  ['CPS-MIMOS Services', 'Dialogue', 29650, 29650, 'Contract signed/PO issued', 'Private', 'Sarah'],
  ['CPS-MIMOS Services', 'Workshop', 10650, 10650, 'Contract signed/PO issued', 'Private', 'Sarah'],
  ['MSSB Staff Development', 'Training', 47800, 47800, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['SIRIM Academy', 'In-House (Overview of Semiconductor Industry for ISO & ESG Consultant', 20999, 20999, 'Contract signed/PO issued', 'Private', 'Adilah'],
  ['Frontken (M) Sdn Bhd', 'In-House (ISO9001, ISO140001, 8D, Presentation Skills)', 94500, 66150, 'Negotiation stage', 'Private', 'Adilah'],
  ['Daffodil Bangladesh', 'Semiconductor', 250000, 75000, 'Proposal/Tender submitted', 'Private', 'Adilah'],
  ['MCMC - Hybrid Intelligence', '1 NADI 1 Prompt Engineer', 367000, 367000, 'Contract signed/PO issued', 'Government', 'Farrah'],
  ['JPN KDN', 'MyKAD Security Modernisation - Phase 1', 400000, 400000, 'Verbal commitment', 'Government', 'Omar'],
  ['JPN KDN', 'PHASE 2 MyKad Security Modernisation', 120000, 120000, 'Negotiation stage', 'Government', 'Omar'],
  ['INTAN', 'AI Strategic Thinking', 49000, 49000, 'Verbal commitment', 'Government', 'Farrah'],
  ['MINDEF IT', 'AI Strategic Workshop Training', 49000, 49000, 'Verbal commitment', 'Government', 'Zalina'],
  ['GEA IPC', 'Certification', 3000000, 0, 'Early engagement', 'Private', 'Sarah'],
  ['Yayasan Peneraju', 'IC Design and AI for Semiconductor Engineers', 1782000, 0, 'Qualified lead/Tender in progress', 'Government', 'Qusyairi'],
  ['Hybrid Intelligence', 'AI Training', 340000, 340000, 'In Progress', 'Private', 'Farrah'],
];

export const opportunities = oppRows.map((row, i) => {
  const [client, project, forecast, weighted, stage, sector, salesman] = row;
  const prob = forecast > 0 ? Math.round((weighted / forecast) * 100) : 0;
  return {
    id: `o${i + 1}`,
    client: clientIdByName(client),
    clientName: client,
    title: project,
    projectTitle: project,
    value: forecast,
    forecastValue: forecast,
    stage,
    opportunityStatus: stage,
    probability: prob,
    weightedForecast: weighted,
    weighted: weighted,
    securedOrderBookValue: stage === 'Contract signed/PO issued' ? forecast : 0,
    sector,
    accountManager: salesman,
    salesman,
    expectedClose: '2026-12-31',
    year: 2026,
  };
});

// ------------------------------------------------------------ Action items
// Real action items from the source tracker. Statuses mapped: Done→Completed,
// KIV kept, In Progress/Pending kept. Priority derived from potential revenue.

export const actionItems = [
  { id: 'a1', client: 'JMTI', service: 'Training', title: 'Raise new PR for JMTI Corporate shirt — 34 pieces', relatedTo: 'JMTI — Corporate Shirt', programmeId: null, programmeCode: null, owner: 'Solehin', personInCharge: 'Solehin', personEmail: '', dueDate: '2026-08-24', status: 'In Progress', potentialRevenue: 0, agingDays: 0, notes: '' },
  { id: 'a2', client: 'Mimos Holding', service: 'Training', title: 'Training certificate completion', relatedTo: 'Mimos Holding — Certificate', programmeId: null, programmeCode: null, owner: 'Solehin', personInCharge: 'Solehin', personEmail: '', dueDate: '2026-08-28', status: 'In Progress', potentialRevenue: 0, agingDays: 0, notes: '' },
  { id: 'a3', client: 'Proposal TTT AI (Naio)', service: 'Training', title: 'Submit Proposal by 4 September', relatedTo: 'TTT AI (Naio) — Proposal', programmeId: null, programmeCode: null, owner: 'Omar', personInCharge: 'Omar', personEmail: '', dueDate: '2026-09-04', status: 'In Progress', potentialRevenue: 0, agingDays: 2, notes: '' },
  { id: 'a4', client: 'NDA TTT AI (Naio)', service: 'Training', title: 'Submit NDA', relatedTo: 'TTT AI (Naio) — NDA', programmeId: null, programmeCode: null, owner: 'Sarah', personInCharge: 'Sarah', personEmail: '', dueDate: '2026-08-24', status: 'In Progress', potentialRevenue: 0, agingDays: 2, notes: '' },
  { id: 'a5', client: 'MARA', service: 'Training', title: 'Hardcopy proposal submitted to MARA', relatedTo: 'MARA — Proposal', programmeId: null, programmeCode: null, owner: 'Adila/Fuziah', personInCharge: 'Adila/Fuziah', personEmail: '', dueDate: '2026-08-13', status: 'Completed', potentialRevenue: 300000, agingDays: 6, notes: '' },
  { id: 'a6', client: 'SST JMTI', service: 'Governance', title: 'Need to give feedback to JMTI in 7 days', relatedTo: 'SST JMTI — Feedback', programmeId: null, programmeCode: null, owner: 'Yusuf', personInCharge: 'Yusuf', personEmail: '', dueDate: '2026-08-19', status: 'In Progress', potentialRevenue: 0, agingDays: 6, notes: 'Sarah has email to request for extension 2 weeks' },
  { id: 'a7', client: 'Mara', service: 'Training', title: 'Semiconductor', relatedTo: 'Mara — Semiconductor', programmeId: null, programmeCode: null, owner: 'Fuzi', personInCharge: 'Fuzi', personEmail: '', dueDate: '2026-08-13', status: 'Completed', potentialRevenue: 0, agingDays: 6, notes: 'Revise price' },
  { id: 'a8', client: 'To Find GTM Staff under Farrah', service: 'Coordination', title: 'Find one Staff under GTM for coordination', relatedTo: 'GTM — Coordination', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: '', dueDate: '2026-08-28', status: 'In Progress', potentialRevenue: 0, agingDays: 6, notes: '' },
  { id: 'a9', client: 'Register MASB under Mimos Berhad', service: 'Registration', title: 'To register MASB under Mimos Berhad', relatedTo: 'MASB — Registration', programmeId: null, programmeCode: null, owner: 'Yusuf', personInCharge: 'Yusuf', personEmail: '', dueDate: '2026-08-14', status: 'Completed', potentialRevenue: 0, agingDays: 7, notes: 'Registration completed' },
  { id: 'a10', client: 'update on courtesy Visit Meeting', service: 'Meeting', title: '3 company baru bagi feedback untuk surat kunjung hormat', relatedTo: 'Courtesy Visit', programmeId: null, programmeCode: null, owner: 'Firzana', personInCharge: 'Firzana', personEmail: '', dueDate: '2026-08-17', status: 'In Progress', potentialRevenue: 0, agingDays: 7, notes: '5 company has provide the feedback. Only ITBM completed the courtesy visit' },
  { id: 'a11', client: 'MAMC', service: 'TOR Guideline', title: 'Come out with guideline', relatedTo: 'MAMC — Guideline', programmeId: null, programmeCode: null, owner: 'Abu Said', personInCharge: 'Abu Said', personEmail: '', dueDate: '2026-08-13', status: 'Completed', potentialRevenue: 0, agingDays: 7, notes: '' },
  { id: 'a12', client: 'PUNB', service: 'Training', title: 'AI Training. Proposal for develop platform (vibe coding). 3 Days training', relatedTo: 'PUNB — AI Training', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-08-14', status: 'In Progress', potentialRevenue: 31500, agingDays: 7, notes: 'Proposal pending from Suhairi (cost outline)' },
  { id: 'a13', client: 'Mindef HAT', service: 'Training', title: 'AI Training. 4 Different group Training for HAT staff', relatedTo: 'Mindef HAT — AI Training', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-09-15', status: 'In Progress', potentialRevenue: 70000, agingDays: 7, notes: 'Proposal in progress' },
  { id: 'a14', client: 'Budiman Dinamik', service: 'Consulting', title: 'NDA teaming agreement, share proposal semiconductor, poster yellow belt september, poster train the trainer nov', relatedTo: 'Budiman Dinamik — Consulting', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: '', dueDate: '2026-08-12', status: 'In Progress', potentialRevenue: 0, agingDays: 8, notes: '' },
  { id: 'a15', client: 'Mockup Internal Training', service: 'Training', title: 'Mockup Training', relatedTo: 'Mockup — Internal Training', programmeId: null, programmeCode: null, owner: 'Dr Nizar', personInCharge: 'Dr Nizar', personEmail: '', dueDate: '2026-08-25', status: 'In Progress', potentialRevenue: 0, agingDays: 12, notes: '' },
  { id: 'a16', client: 'PMP Refresher internal training', service: 'Training', title: 'Half Day Training', relatedTo: 'PMP Refresher', programmeId: null, programmeCode: null, owner: 'Dr Nizar', personInCharge: 'Dr Nizar', personEmail: '', dueDate: '2026-08-24', status: 'In Progress', potentialRevenue: 0, agingDays: 12, notes: '' },
  { id: 'a17', client: 'OA MIMOS', service: 'Consulting', title: 'Knowledge Sharing booking System for training room to all OA in MIMOS', relatedTo: 'OA MIMOS — Booking System', programmeId: null, programmeCode: null, owner: "Abu Sa'id", personInCharge: "Abu Sa'id", personEmail: '', dueDate: '2026-08-05', status: 'Completed', potentialRevenue: 0, agingDays: 14, notes: '' },
  { id: 'a18', client: 'AI-CoE in ARMC', service: 'PO and INVOICE', title: 'To compile quotation PO and INVOICE (Hardcopy)', relatedTo: 'AI-CoE ARMC — PO/Invoice', programmeId: null, programmeCode: null, owner: 'Yusof', personInCharge: 'Yusof', personEmail: '', dueDate: '2026-08-05', status: 'In Progress', potentialRevenue: 0, agingDays: 14, notes: 'Pending from MA Team to provide' },
  { id: 'a19', client: 'Zamri', service: 'Consulting', title: 'To follow up with Zamri on DOA and invoice', relatedTo: 'Zamri — DOA/Invoice', programmeId: null, programmeCode: null, owner: 'Solehin', personInCharge: 'Solehin', personEmail: '', dueDate: '2026-08-07', status: 'Completed', potentialRevenue: 0, agingDays: 14, notes: 'We have received the invoice from Finance' },
  { id: 'a20', client: 'AI-CoE in ARMC', service: 'Training', title: 'Pending quotation. Target to submit by this week', relatedTo: 'AI-CoE ARMC — Quotation', programmeId: null, programmeCode: null, owner: 'Sarah', personInCharge: 'Sarah', personEmail: '', dueDate: '2026-08-07', status: 'In Progress', potentialRevenue: 50000, agingDays: 14, notes: '' },
  { id: 'a21', client: 'BPM MINDEF', service: 'Training', title: 'AI Training for 30 pax (2 phase). TTT for 10 pax', relatedTo: 'BPM MINDEF — AI Training', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: 'qusyairi.zolkefle@gmail.com', dueDate: '2026-09-15', status: 'Pending', potentialRevenue: 134990, agingDays: 15, notes: '' },
  { id: 'a22', client: 'UIA', service: 'Training', title: 'Semiconductor Training 26-27 November for 30 pax', relatedTo: 'UIA — Semiconductor', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-11-26', status: 'In Progress', potentialRevenue: 9000, agingDays: 15, notes: '' },
  { id: 'a23', client: 'Mimos-IVV for KDN', service: 'Training', title: 'Data Science Training — 3 days — August/October', relatedTo: 'Mimos-IVV KDN — Data Science', programmeId: null, programmeCode: null, owner: 'Zalina', personInCharge: 'Zalina', personEmail: '', dueDate: '', status: 'In Progress', potentialRevenue: 20000, agingDays: 15, notes: '' },
  { id: 'a24', client: 'UTP', service: 'Training', title: 'Semiconductor Training', relatedTo: 'UTP — Semiconductor', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-10-20', status: 'In Progress', potentialRevenue: 16500, agingDays: 15, notes: '20-22 October. Training for 5 lecturers' },
  { id: 'a25', client: 'JTM', service: 'Training', title: 'Need to follow-up with En Nabil from JTM', relatedTo: 'JTM — Follow up', programmeId: null, programmeCode: null, owner: 'Fuzy', personInCharge: 'Fuziah', personEmail: 'fuziah.rahim@mimos.my', dueDate: '', status: 'Completed', potentialRevenue: 0, agingDays: 19, notes: 'JTM masih belum terima baki peruntukan drpd menteri kewangan (MoF), latihan Fasa 2 ditunda ke 17 Ogos 2026' },
  { id: 'a26', client: 'Public Training', service: 'Training', title: 'Training delivered on 20 and 21 July 2026', relatedTo: 'Public Training — July', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-07-21', status: 'Completed', potentialRevenue: 0, agingDays: 19, notes: 'Public Training AI System Thinking — 8 pax attended from KETENGAH, PERNAS, MAIS' },
  { id: 'a27', client: 'Institut Aminuddin Baki', service: 'Training', title: 'TTT training delivery from 27 July until 31 July 2026', relatedTo: 'IAB — TTT AI', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-07-31', status: 'Completed', potentialRevenue: 0, agingDays: 19, notes: 'TTT AI for Institut Aminuddin Baki — 15 pax attended' },
  { id: 'a28', client: 'UZMA', service: 'Training', title: 'HRD grant application from Uzma approved — RM21,000', relatedTo: 'Uzma — HRD Grant', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-08-05', status: 'In Progress', potentialRevenue: 21000, agingDays: 19, notes: '' },
  { id: 'a29', client: 'TNB ILSAS', service: 'Training', title: 'Received LoA from TNB ILSAS for AI Training — RM82,000', relatedTo: 'TNB ILSAS — LoA', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '', status: 'In Progress', potentialRevenue: 82000, agingDays: 19, notes: '' },
  { id: 'a30', client: 'INTAN', service: 'Training', title: 'INTAN requested training outline for TTT & date for syllabus discussion', relatedTo: 'INTAN — TTT', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '', status: 'In Progress', potentialRevenue: 0, agingDays: 19, notes: 'Start with one TTT class by Sept/Oct' },
  { id: 'a31', client: 'mimos solutions', service: 'Workshop', title: 'Workshop proposal and quotation submitted to Mimos Solutions. Location at Fairview Hotel', relatedTo: 'Mimos Solutions — Workshop MINDEF', programmeId: null, programmeCode: null, owner: 'Zalina', personInCharge: 'Zalina', personEmail: '', dueDate: '2026-09-02', status: 'In Progress', potentialRevenue: 496800, agingDays: 22, notes: '' },
  { id: 'a32', client: 'Protege Program under MTVET', service: 'Placement', title: 'Identified 20 protege placement within mimos group pending assessment/interview', relatedTo: 'Protege MTVET — Placement', programmeId: null, programmeCode: null, owner: 'Sarah', personInCharge: 'Sarah', personEmail: '', dueDate: '2026-08-14', status: 'Pending', potentialRevenue: 720000, agingDays: 22, notes: 'Plan to start by August' },
  { id: 'a33', client: 'Nice Event at KLCC', service: 'Event', title: '26-28 August for MA at KLCC. Preparation using our own budget', relatedTo: 'KLCC Event', programmeId: null, programmeCode: null, owner: 'Qusyairi/Omar', personInCharge: 'Qusyairi/Omar', personEmail: '', dueDate: '2026-08-26', status: 'In Progress', potentialRevenue: 0, agingDays: 22, notes: 'Need to prepare website before event' },
  { id: 'a34', client: 'MIMOS IPM (for KDN Project)', service: 'Training', title: 'Proposals submitted to IPM: PMI-ACP Training (RM50,680), Agile PM Essentials (RM18,240)', relatedTo: 'MIMOS IPM — KDN', programmeId: null, programmeCode: null, owner: 'Zalina Sayuti', personInCharge: 'Zalina', personEmail: 'zalina@mimos.my', dueDate: '2026-08-11', status: 'Completed', potentialRevenue: 68920, agingDays: 34, notes: 'Training cancelled' },
  { id: 'a35', client: 'KDN JPN', service: 'Consulting', title: 'MyKad Security Modernisation Phase 1 — 400k/4weeks', relatedTo: 'KDN JPN — MyKad Phase 1', programmeId: null, programmeCode: null, owner: 'Omar Khalid', personInCharge: 'Omar', personEmail: 'omarkhalidazmi@gmail.com', dueDate: '2026-06-15', status: 'Completed', potentialRevenue: 0, agingDays: 35, notes: '' },
  { id: 'a36', client: 'APD K-Youth Programme (Student University)', service: 'Training', title: 'Online webinar for student university 238 pax x 4 cohorts', relatedTo: 'APD K-Youth — Student', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: 'adilah.nisman@mimos.my', dueDate: '2026-09-17', status: 'In Progress', potentialRevenue: 47600, agingDays: 36, notes: 'Kick off 1st cohort 17 Sept' },
  { id: 'a37', client: 'Hybrid Intelligence', service: 'Training', title: 'Get updates on PO — to purchase laptop & tablet — get quotation from MIMOS Solutions', relatedTo: 'Hybrid Intelligence — PO', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'sayeedafarrah@gmail.com', dueDate: '2026-07-09', status: 'In Progress', potentialRevenue: 340000, agingDays: 47, notes: '' },
  { id: 'a38', client: 'GEA IPC', service: 'Training and Certification', title: 'Documentation and information on Equipment', relatedTo: 'GEA IPC — Certification', programmeId: null, programmeCode: null, owner: 'Sarah Ramli', personInCharge: 'Sarah', personEmail: 'ssarah.ramli@gmail.com', dueDate: '2026-07-10', status: 'Pending', potentialRevenue: 3000000, agingDays: 47, notes: 'Put on hold until we have our own account' },
  { id: 'a39', client: 'MASTIC (MOSTI)', service: 'Space Rental at MIMOS KHTP', title: 'Quotation and cost sheet sent to Mr Fairus for approval. Pending feedback from MASTIC', relatedTo: 'MASTIC — Space Rental', programmeId: null, programmeCode: null, owner: "Abu Sa'id", personInCharge: "Abu Sa'id", personEmail: 'saidrazak88@gmail.com', dueDate: '2026-08-28', status: 'Completed', potentialRevenue: 8000, agingDays: 54, notes: 'Roundtable discussion with industry (October 2026)' },
  { id: 'a40', client: 'Unit Perancang Ekonomi Negeri (UPEN) Selangor', service: 'Training', title: 'Submitted quotation. To follow up on the status of the proposal', relatedTo: 'UPEN Selangor — Proposal', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-06-30', status: 'In Progress', potentialRevenue: 300000, agingDays: 55, notes: '' },
  { id: 'a41', client: 'Institut Aminuddin Babi', service: 'TTT and LLM Development', title: 'Confirm with vendor for accommodation & training centre/venue. Send quotation to IAB', relatedTo: 'IAB — TTT/LLM', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-06-29', status: 'In Progress', potentialRevenue: 49000, agingDays: 55, notes: '' },
  { id: 'a42', client: 'KPDN', service: 'Coordination of AI Vibe Coding', title: 'Request status of ePerolehan for PO. Coordinate training (F&B). Provide company documents to KPDN', relatedTo: 'KPDN — AI Vibe Coding', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: 'farrah.johar@mimos.my', dueDate: '2026-06-30', status: 'In Progress', potentialRevenue: 49500, agingDays: 55, notes: '' },
  { id: 'a43', client: 'APD K-Youth Programme (Graduate)', service: 'Training', title: 'Semiconductor Training to be conducted from 1 September onwards 25 pax x 13 cohorts', relatedTo: 'APD K-Youth — Graduate', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-09-01', status: 'In Progress', potentialRevenue: 455000, agingDays: 68, notes: '1st cohort to kick off 1 Sept' },
  { id: 'a44', client: 'EFC-K-Youth Programme (Graduate)', service: 'Training', title: 'Semiconductor Training to be conducted in Aug 20 pax x 1 cohort', relatedTo: 'EFC K-Youth — Graduate', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-08-17', status: 'In Progress', potentialRevenue: 100000, agingDays: 68, notes: 'Kick off programme 17 Aug till 18 Sept' },
  { id: 'a45', client: 'Yayasan Peneraju-kredenzaa', service: 'Collaborator', title: 'NDA (send for stamping) and Teaming Agreement', relatedTo: 'Yayasan Peneraju — kredenzaa', programmeId: null, programmeCode: null, owner: 'Sarah', personInCharge: 'Sarah', personEmail: '', dueDate: '2026-07-31', status: 'Completed', potentialRevenue: 0, agingDays: 70, notes: 'Teaming agreement completed' },
  { id: 'a46', client: 'MPC', service: 'Training', title: 'Need to prepare the quotation for Training RM19500', relatedTo: 'MPC — Quotation', programmeId: null, programmeCode: null, owner: 'Farrah', personInCharge: 'Farrah', personEmail: '', dueDate: '2026-06-12', status: 'Completed', potentialRevenue: 0, agingDays: 72, notes: '' },
  { id: 'a47', client: 'APEC', service: 'Consulting', title: 'To assess 13 research paper registration and discuss with appointed contractor', relatedTo: 'APEC — Research Papers', programmeId: null, programmeCode: null, owner: 'Sarah Ramli', personInCharge: 'Sarah', personEmail: 'ssarah.ramli@gmail.com', dueDate: '2026-08-28', status: 'In Progress', potentialRevenue: 0, agingDays: 76, notes: '8 paper has been selected' },
  { id: 'a48', client: 'Aswara', service: 'Training', title: 'Adilah to assist provide the proposal and quotation', relatedTo: 'Aswara — Proposal', programmeId: null, programmeCode: null, owner: 'Omar Khalid, Adila', personInCharge: 'Omar', personEmail: '', dueDate: '2026-06-19', status: 'In Progress', potentialRevenue: 0, agingDays: 97, notes: 'Proposal has been submitted. Pending from Aswara' },
  { id: 'a49', client: 'Air Borneo', service: 'Training', title: 'Submitted quotation and proposal. Now waiting for the feedback', relatedTo: 'Air Borneo — Proposal', programmeId: null, programmeCode: null, owner: 'Omar Khalid', personInCharge: 'Omar', personEmail: '', dueDate: '2026-06-26', status: 'In Progress', potentialRevenue: 0, agingDays: 97, notes: 'Meeting with Air Borneo next Wednesday — LCCT' },
  { id: 'a50', client: 'National AI Office', service: 'Training', title: 'Waiting for tender to be out', relatedTo: 'NAIO — Tender', programmeId: null, programmeCode: null, owner: 'Adilah', personInCharge: 'Adilah', personEmail: '', dueDate: '2026-06-19', status: 'In Progress', potentialRevenue: 0, agingDays: 97, notes: 'Adilah to assist preparing the Technical Documents' },
];

// Derive priority from potential revenue for display compatibility.
actionItems.forEach((a) => {
  a.priority = a.potentialRevenue >= 100000 ? 'High' : a.potentialRevenue > 0 ? 'Medium' : 'Low';
});

// ------------------------------------------------------------ Notifications

export const notifications = [
  { id: 'n1', text: 'Invoice 95000019/2026 (University College TATI) is unpaid', time: '2h ago', tone: 'red' },
  { id: 'n2', text: 'Payment confirmed — RM 445,500 from JMTI (95000070/2026)', time: '5h ago', tone: 'green' },
  { id: 'n3', text: 'Quotation MASB/QT/TRA/2026/0083rev2 awaiting payment from MIMOS Solutions', time: '1d ago', tone: 'amber' },
  { id: 'n4', text: 'New action item: BPM MINDEF AI Training — RM 134,990', time: '1d ago', tone: 'violet' },
  { id: 'n5', text: 'Invoice 95000024/2026 (SIRIM Academy) is overdue', time: '2d ago', tone: 'red' },
];

// ------------------------------------------------------- Monthly financials
// Derived from real invoice dates and collection values in the records.

const monthKey = (iso) => (iso ? new Date(iso).toLocaleDateString('en-MY', { month: 'short' }) : null);
const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const monthlyFinancials = (() => {
  const map = {};
  records.forEach((r) => {
    const m = monthKey(r.invoiceDate);
    if (!m) return;
    if (!map[m]) map[m] = { month: m, revenue: 0, collection: 0 };
    map[m].revenue += r.invoiceValue;
    map[m].collection += r.collection;
  });
  return monthOrder
    .filter((m) => map[m])
    .map((m) => ({ month: m, revenue: Math.round(map[m].revenue * 100) / 100, collection: Math.round(map[m].collection * 100) / 100 }));
})();

// ------------------------------------------------------------ Derived totals

const paidInvoices = invoices.filter((i) => i.paymentStatus === 'PAID');

export const totals = {
  revenue: invoices.reduce((s, i) => s + i.amount, 0),
  collected: payments.reduce((s, p) => s + p.amount, 0),
  get outstanding() {
    return this.revenue - this.collected;
  },
  overdue: invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((s, i) => s + i.outstandingAmount, 0),
};

export const openOpportunities = opportunities.filter((o) => o.stage !== 'Lost/No-go');

export const pipelineValue = openOpportunities.reduce((s, o) => s + o.value, 0);

export const weightedPipelineValue = openOpportunities.reduce(
  (s, o) => s + o.weighted,
  0,
);

export const funnelByStage = FUNNEL_STAGES.map(({ stage, color, probability }) => {
  const items = opportunities.filter((o) => o.stage === stage);
  return {
    stage,
    color,
    probability,
    count: items.length,
    value: items.reduce((s, o) => s + o.value, 0),
    weighted: items.reduce((s, o) => s + o.weighted, 0),
  };
});

/** Secured order book = forecast value of Contract signed/PO issued opportunities */
export const securedOrderBook = opportunities
  .filter((o) => o.stage === 'Contract signed/PO issued')
  .reduce((s, o) => s + o.value, 0);

export const programmeCompletenessAvg = Math.round(
  programmes.reduce((s, p) => s + p.progress, 0) / Math.max(programmes.length, 1),
);

// -------------------------------------------------------- Client contacts
// Source documents do not publish per-client contact directories; the
// account manager (real PIC) is listed as the primary contact.

export const clientContacts = clients
  .filter((c) => c.contactPerson)
  .map((c, i) => ({
    id: `cc${i + 1}`,
    client: c.id,
    name: c.contactPerson,
    title: 'Account Manager',
    email: c.email,
    phone: c.phone,
    isPrimary: true,
  }));

// ---------------------------------------------------- Training statistics
// Aggregated delivery metrics per programme. Financial fields are exact
// from the PDFs; attendance/completion derived from delivery progress.

export const trainingStatistics = programmes.map((p, i) => {
  const r = records[i];
  const domain = (p.trainingType || '').replace('Training-', '').replace('Rental-', '');
  return {
    id: `ts${i + 1}`,
    programmeId: p.id,
    trainingDate: r.startDate,
    trainingName: p.title,
    trainingCategory: p.trainingType,
    domain,
    workshopCount: p.programmeCategory === 'Workshop' ? 1 : 0,
    trainingCount: p.programmeCategory !== 'Workshop' ? 1 : 0,
    totalCount: 1,
    bumiputeraCount: 0,
    nonBumiputeraCount: 0,
    totalCharges: p.totalRevenueExclSST,
    sstAmount: p.sstAmount,
    finalCharges: p.totalRevenueInclSST,
    sessionsPlanned: p.sessionsPlanned,
    sessionsDelivered: p.sessionsDelivered,
    attendanceRate: p.status === 'Completed' ? 95 : p.status === 'In Progress' ? 88 : 0,
    completionRate: p.progress,
    avgScore: p.status === 'Completed' ? 4.5 : 0,
    npsScore: p.status === 'Completed' ? 50 : 0,
    lastSession: r.endDate,
  };
});

// ------------------------------------------------------------- Training sessions
// One session per programme (the delivery row).

export const trainingSessions = records.map((r, i) => {
  const p = programmes[i];
  return {
    id: `t${i + 1}`,
    title: r.title,
    programme: r.title,
    programmeCode: p.code,
    programmeId: p.id,
    date: r.startDate,
    time: r.startDate && r.endDate && r.startDate !== r.endDate ? 'Multi-day' : '09:00 – 17:00',
    trainer: r.pic,
    venue: p.venue,
    mode: r.programmeCategory === 'Public' ? 'In-Person' : r.programmeCategory === 'Workshop' ? 'In-Person' : 'In-Person',
    status: p.status === 'Completed' ? 'Completed' : p.status === 'Scheduled' ? 'Scheduled' : 'Scheduled',
  };
});

// ------------------------------------------------------------- Participants
// Individual participant names are not published in the source documents.

export const participants = [];

// ------------------------------------------------------------ Documents
// Document-level records are not published in the source documents.

export const documents = [];

// ---------------------------------------------------------- Audit history
// Append-only event log derived from real invoice/payment events.

export const auditHistory = records.flatMap((r, i) => {
  const p = programmes[i];
  const events = [];
  events.push({
    id: `ah${i + 1}a`,
    programmeId: p.id,
    action: 'Created',
    entity: 'Programme',
    description: `Programme ${p.code} created for ${r.client}`,
    user: r.accountManager,
    timestamp: `${r.startDate}T09:00:00`,
  });
  if (r.invoiceNo) {
    events.push({
      id: `ah${i + 1}b`,
      programmeId: p.id,
      action: 'Created',
      entity: 'Invoice',
      description: `Invoice ${r.invoiceNo} raised for RM ${r.invoiceValue.toLocaleString('en-MY')}`,
      user: r.accountManager,
      timestamp: `${r.invoiceDate || r.startDate}T10:00:00`,
    });
  }
  if (r.paymentStatus === 'PAID' && r.collection) {
    events.push({
      id: `ah${i + 1}c`,
      programmeId: p.id,
      action: 'Updated',
      entity: 'Payment',
      description: `Payment confirmed — RM ${r.collection.toLocaleString('en-MY')} from ${r.client}`,
      user: r.accountManager,
      timestamp: `${r.paymentDate || r.invoiceDate || r.startDate}T11:00:00`,
    });
  }
  return events;
});

export const BUSINESS_FLOW = [
  'Opportunity',
  'Quotation',
  'Purchase Order',
  'Programme',
  'Training Delivery',
  'Invoice',
  'Payment Collection',
];
