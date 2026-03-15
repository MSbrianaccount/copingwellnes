// Report Controller
// Generates analytics, statistics, and exportable reports

class ReportController {
  constructor() {
    this.reportService = new ReportService();
  }

  generatePatientReport(patientId, reportType = 'summary') {
    try {
      const report = this.reportService.generatePatientReport(patientId, reportType);
      console.log('Patient report generated:', patientId);
      return { success: true, data: report };
    } catch (error) {
      console.error('Error generating patient report:', error);
      return { success: false, error: error.message };
    }
  }

  generateFinancialReport(startDate, endDate) {
    try {
      const report = this.reportService.generateFinancialReport(startDate, endDate);
      console.log('Financial report generated');
      return { success: true, data: report };
    } catch (error) {
      console.error('Error generating financial report:', error);
      return { success: false, error: error.message };
    }
  }

  generateStaffReport(staffId = null) {
    try {
      const report = this.reportService.generateStaffReport(staffId);
      console.log('Staff report generated');
      return { success: true, data: report };
    } catch (error) {
      console.error('Error generating staff report:', error);
      return { success: false, error: error.message };
    }
  }

  generateDashboardAnalytics() {
    try {
      const analytics = this.reportService.generateDashboardAnalytics();
      console.log('Dashboard analytics generated');
      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error generating dashboard analytics:', error);
      return { success: false, error: error.message };
    }
  }

  generateReport(reportType, filters) {
    try {
      const report = this.reportService.generateReport(reportType, filters);
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  exportReport(reportData, format) {
    try {
      let result;
      if (format === 'pdf') {
        result = this.reportService.exportToPDF(reportData);
      } else if (format === 'csv') {
        result = this.reportService.exportToCSV(reportData);
      } else {
        throw new Error('Unsupported format');
      }
      console.log('Report exported:', format);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error exporting report:', error);
      return { success: false, error: error.message };
    }
  }

  getReports() {
    try {
      const reports = this.reportService.getAvailableReports();
      return { success: true, data: reports };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
