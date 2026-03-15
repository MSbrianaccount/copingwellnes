// Finance Controller
// Manages billing, invoices, payments, and financial reports

class FinanceController {
  constructor() {
    this.financeModel = new FinanceModel();
    this.billingService = new BillingService();
  }

  getAllInvoices() {
    try {
      const invoices = this.financeModel.getAllInvoices();
      console.log('Retrieved all invoices:', invoices.length);
      return { success: true, data: invoices };
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      return { success: false, error: error.message };
    }
  }

  getInvoiceById(invoiceId) {
    try {
      const invoice = this.financeModel.getInvoiceById(invoiceId);
      return { success: true, data: invoice };
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return { success: false, error: error.message };
    }
  }

  createInvoice(invoiceData) {
    try {
      const result = this.financeModel.createInvoice(invoiceData);
      console.log('Invoice created:', invoiceData.invoiceNo);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  recordPayment(paymentData) {
    try {
      const result = this.financeModel.recordPayment(paymentData);
      console.log('Payment recorded');
      return { success: true, data: result };
    } catch (error) {
      console.error('Error recording payment:', error);
      return { success: false, error: error.message };
    }
  }

  getInvoices() {
    return this.getAllInvoices();
  }

  getPayments() {
    try {
      const payments = this.financeModel.getAllPayments();
      return { success: true, data: payments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getFinancialSummary(startDate, endDate) {
    try {
      const summary = this.financeModel.getFinancialSummary(startDate, endDate);
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  calculateBillingAmount(services) {
    try {
      const amount = this.billingService.calculateTotal(services);
      return { success: true, data: { total: amount } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
