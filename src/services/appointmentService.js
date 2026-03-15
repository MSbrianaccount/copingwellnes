// Appointment Booking System
// Handles appointment scheduling, rescheduling, and cancellation

class AppointmentBooking {
  static showBookingForm() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'booking-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Book Appointment</h2>
          <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="appointment-form" onsubmit="AppointmentBooking.submitBooking(event)">
            <div class="form-group">
              <label for="patient-id">Patient *</label>
              <select id="patient-id" name="patientId" required>
                <option value="">-- Select Patient --</option>
              </select>
            </div>

            <div class="form-group">
              <label for="doctor-id">Doctor *</label>
              <select id="doctor-id" name="doctorId" required>
                <option value="">-- Select Doctor --</option>
              </select>
            </div>

            <div class="form-group">
              <label for="appointment-date">Date *</label>
              <input type="date" id="appointment-date" name="date" required min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
              <label for="appointment-time">Time *</label>
              <input type="time" id="appointment-time" name="time" required>
            </div>

            <div class="form-group">
              <label for="appointment-reason">Reason for Visit</label>
              <textarea id="appointment-reason" name="reason" rows="3" placeholder="Enter reason for appointment"></textarea>
            </div>

            <div class="form-group">
              <label for="appointment-notes">Notes</label>
              <textarea id="appointment-notes" name="notes" rows="2" placeholder="Any additional notes"></textarea>
            </div>

            <button type="submit" class="submit-btn">Book Appointment</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Populate patients
    const patients = DB.getPatients();
    const patientSelect = document.getElementById('patient-id');
    patients.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.firstName + ' ' + p.lastName;
      patientSelect.appendChild(option);
    });

    // Populate doctors
    const doctors = DB.getStaff({ role: 'doctor' });
    const doctorSelect = document.getElementById('doctor-id');
    doctors.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.firstName + ' ' + d.lastName;
      doctorSelect.appendChild(option);
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  static submitBooking(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const patientId = parseInt(formData.get('patientId'));
    const doctorId = parseInt(formData.get('doctorId'));
    
    const patient = DB.getPatientById(patientId);
    const doctor = DB.getStaff().find(s => s.id === doctorId);
    
    if (!patient || !doctor) {
      alert('Please select valid patient and doctor');
      return;
    }

    const appointmentData = {
      patientId: patientId,
      patientName: patient.firstName + ' ' + patient.lastName,
      doctorId: doctorId,
      doctorName: doctor.firstName + ' ' + doctor.lastName,
      date: formData.get('date'),
      time: formData.get('time'),
      reason: formData.get('reason'),
      notes: formData.get('notes'),
      status: 'scheduled'
    };

    const appointment = DB.addAppointment(appointmentData);
    
    alert('Appointment booked successfully!\nAppointment ID: ' + appointment.id);
    document.getElementById('booking-modal').remove();
    
    // Reload appointments if the function exists
    if (typeof app !== 'undefined' && app.loadAppointments) {
      app.loadAppointments();
    }
  }

  static cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      DB.cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully');
      if (typeof app !== 'undefined' && app.loadAppointments) {
        app.loadAppointments();
      }
    }
  }

  static getAvailableSlots(doctorId, date) {
    // Get all appointments for the doctor on this date
    const appointments = DB.getAppointments({ doctorId: doctorId, date: date });
    
    // Define working hours (9 AM to 5 PM, 30-min slots)
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const isBooked = appointments.some(a => a.time === timeStr);
        slots.push({
          time: timeStr,
          available: !isBooked
        });
      }
    }
    
    return slots;
  }
}
