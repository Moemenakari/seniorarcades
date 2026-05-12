/**
 * ============================================================
 * FINANCE ROUTES
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Defines API endpoints for financial operations, 
 * including expenses, revenue, debts, and audits.
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');

/**
 * ==========================================
 * FINANCIAL ANALYTICS
 * ==========================================
 */
router.get('/stats', financeController.getFinanceStats);

/**
 * ==========================================
 * EXPENSES MANAGEMENT
 * ==========================================
 */
router.get('/expenses', financeController.getExpenses);
router.post('/expense', financeController.addExpense);
router.put('/expense/:id', financeController.updateExpense);
router.put('/expense/:id/pay', financeController.markExpensePaid);
router.delete('/expense/:id', financeController.deleteExpense);

/**
 * ==========================================
 * INCOME & SETTLEMENTS
 * ==========================================
 */
router.get('/income-records', financeController.getAllIncomeRecords);
router.post('/income', financeController.addIncome);
router.post('/settle-event', financeController.settleFromEvent);
router.post('/smart-income', financeController.addSmartIncome);

/**
 * ==========================================
 * DEBT MANAGEMENT
 * ==========================================
 */
router.get('/debts', financeController.getDebts);
router.post('/settle/:id', financeController.settleDebt);

/**
 * ==========================================
 * AUDIT LOGS & FINANCIAL HISTORY
 * ==========================================
 */
router.get('/audit', financeController.getAuditLogs);
router.get('/logs', financeController.getFinanceLogs);
router.post('/log', financeController.addFinanceLog);
router.delete('/log/:id', financeController.deleteFinanceLog);

module.exports = router;

