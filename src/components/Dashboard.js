// Dashboard Component
// Manages dashboard UI and metrics display

class Dashboard {
  constructor() {
    this.metrics = {
      totalPatients: 0,
      totalStaff: 0,
      totalRevenue: 0,
      pendingInvoices: 0
    };
  }

  updateMetrics(data) {
    try {
      this.metrics = { ...this.metrics, ...data };
      this.render();
      return { success: true };
    } catch (error) {
      console.error('Error updating metrics:', error);
      return { success: false, error: error.message };
    }
  }

  render() {
    try {
      const dashboardContent = document.getElementById('content-area');
      if (!dashboardContent) return;

      dashboardContent.innerHTML = `
        <div class="dashboard-container">
          <h2>Dashboard</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Total Patients</h3>
              <p class="metric-value">${this.metrics.totalPatients}</p>
            </div>
            <div class="metric-card">
              <h3>Total Staff</h3>
              <p class="metric-value">${this.metrics.totalStaff}</p>
            </div>
            <div class="metric-card">
              <h3>Total Revenue</h3>
              <p class="metric-value">$${this.metrics.totalRevenue.toFixed(2)}</p>
            </div>
            <div class="metric-card">
              <h3>Pending Invoices</h3>
              <p class="metric-value">${this.metrics.pendingInvoices}</p>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error rendering dashboard:', error);
    }
  }

  getMetrics() {
    return this.metrics;
  }
}
