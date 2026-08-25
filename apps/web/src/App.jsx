import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProgrammesPage from './pages/ProgrammesPage';
import ProgrammeDetailPage from './pages/ProgrammeDetailPage';
import ClientsPage from './pages/ClientsPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import TrainingPage from './pages/TrainingPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ActionItemsPage from './pages/ActionItemsPage';
import ReportsPage from './pages/ReportsPage';
import AdministrationPage from './pages/AdministrationPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';

const guarded = (path, element) => <RoleRoute path={path}>{element}</RoleRoute>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Toaster position="top-right" richColors closeButton />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={guarded('/', <DashboardPage />)} />
                        <Route path="/programmes" element={guarded('/programmes', <ProgrammesPage />)} />
                        <Route path="/programmes/:id" element={guarded('/programmes', <ProgrammeDetailPage />)} />
                        <Route path="/clients" element={guarded('/clients', <ClientsPage />)} />
                        <Route path="/opportunities" element={guarded('/opportunities', <OpportunitiesPage />)} />
                        <Route path="/quotations" element={guarded('/quotations', <QuotationsPage />)} />
                        <Route path="/purchase-orders" element={guarded('/purchase-orders', <PurchaseOrdersPage />)} />
                        <Route path="/invoices" element={guarded('/invoices', <InvoicesPage />)} />
                        <Route path="/payments" element={guarded('/payments', <PaymentsPage />)} />
                        <Route path="/training" element={guarded('/training', <TrainingPage />)} />
                        <Route path="/participants" element={guarded('/participants', <ParticipantsPage />)} />
                        <Route path="/action-items" element={guarded('/action-items', <ActionItemsPage />)} />
                        <Route path="/reports" element={guarded('/reports', <ReportsPage />)} />
                        <Route path="/administration" element={guarded('/administration', <AdministrationPage />)} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
