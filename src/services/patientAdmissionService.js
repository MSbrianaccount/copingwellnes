// Patient Admission System
// Allows doctors to admit new patients

class PatientAdmission {
  static showAdmissionForm() {
    const user = AuthManager.getCurrentUser();
    
    if (user.role !== 'doctor' && user.role !== 'admin') {
      alert('Only doctors and admins can admit patients');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'admission-modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>Admit Patient</h2>
          <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="admission-form" onsubmit="PatientAdmission.submitAdmission(event)">
            <fieldset style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
              <legend style="padding: 0 0.5rem;">Personal Information</legend>
              
              <div class="form-group">
                <label for="first-name">First Name *</label>
                <input type="text" id="first-name" name="firstName" required>
              </div>

              <div class="form-group">
                <label for="last-name">Last Name *</label>
                <input type="text" id="last-name" name="lastName" required>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
              </div>

              <div class="form-group">
                <label for="phone">Phone *</label>
                <input type="tel" id="phone" name="phone" required>
              </div>

              <div class="form-group">
                <label for="dob">Date of Birth</label>
                <input type="date" id="dob" name="dateOfBirth">
              </div>

              <div class="form-group">
                <label for="gender">Gender</label>
                <select id="gender" name="gender">
                  <option value="">-- Select --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </fieldset>

            <fieldset style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
              <legend style="padding: 0 0.5rem;">Medical Information</legend>
              
              <div class="form-group">
                <label for="diagnosis">Diagnosis *</label>
                <textarea id="diagnosis" name="diagnosis" rows="3" required placeholder="Enter patient diagnosis"></textarea>
              </div>

              <div class="form-group">
                <label for="allergies">Allergies</label>
                <textarea id="allergies" name="allergies" rows="2" placeholder="List any known allergies"></textarea>
              </div>

              <div class="form-group">
                <label for="medications">Current Medications</label>
                <textarea id="medications" name="medications" rows="2" placeholder="List current medications"></textarea>
              </div>

              <div class="form-group">
                <label for="medical-history">Medical History</label>
                <textarea id="medical-history" name="medicalHistory" rows="2" placeholder="Relevant medical history"></textarea>
              </div>
            </fieldset>

            <fieldset style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
              <legend style="padding: 0 0.5rem;">Admission Details</legend>
              
              <div class="form-group">
                <label for="admission-date">Admission Date *</label>
                <input type="date" id="admission-date" name="admissionDate" required>
              </div>

              <div class="form-group">
                <label for="ward">Ward/Room</label>
                <input type="text" id="ward" name="ward" placeholder="e.g., Rehab Ward A, Room 101">
              </div>

              <div class="form-group">
                <label for="treatment-plan">Treatment Plan *</label>
                <textarea id="treatment-plan" name="treatmentPlan" rows="3" required placeholder="Outline the treatment plan"></textarea>
              </div>

              <div class="form-group">
                <label for="emergency-contact">Emergency Contact *</label>
                <input type="text" id="emergency-contact" name="emergencyContact" required placeholder="Name and phone number">
              </div>
            </fieldset>

            <button type="submit" class="submit-btn">Admit Patient</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set today's date as default
    document.getElementById('admission-date').valueAsDate = new Date();

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  static submitAdmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const user = AuthManager.getCurrentUser();
    
    const patientData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      diagnosis: formData.get('diagnosis'),
      allergies: formData.get('allergies'),
      medications: formData.get('medications'),
      medicalHistory: formData.get('medicalHistory'),
      admissionDate: formData.get('admissionDate'),
      ward: formData.get('ward'),
      treatmentPlan: formData.get('treatmentPlan'),
      emergencyContact: formData.get('emergencyContact'),
      doctorId: user.userId,
      doctorName: user.name,
      status: 'active'
    };

    const patient = DB.addPatient(patientData);
    
    alert('Patient admitted successfully!\nPatient ID: ' + patient.id);
    document.getElementById('admission-modal').remove();
    
    // Reload patients if the function exists
    if (typeof app !== 'undefined' && app.loadPatients) {
      app.loadPatients();
    }
  }
}
