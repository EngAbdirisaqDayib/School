const StudentsPage = {
  render() {
    const students = Storage.getStudents();
    const classes = Storage.getClasses();
    const isAdmin = Auth.getSession().role === 'admin';

    return `
      <div class="toolbar">
        <input type="text" class="search-input" id="student-search" placeholder="Search students...">
        <select class="filter-select" id="student-class-filter">
          <option value="">All Classes</option>
          ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        ${isAdmin ? '<button class="btn btn-primary" id="add-student-btn">+ Add Student</button>' : ''}
      </div>
      <div class="card">
        <div class="card-body table-wrap">
          <table id="students-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Class</th><th>Phone</th><th>Status</th>${isAdmin ? '<th>Actions</th>' : ''}</tr>
            </thead>
            <tbody>${this.renderRows(students)}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderRows(students) {
    const isAdmin = Auth.getSession().role === 'admin';
    if (!students.length) return `<tr><td colspan="${isAdmin ? 7 : 6}">${UI.emptyState('👨‍🎓', 'No students found')}</td></tr>`;
    return students.map(s => `
      <tr data-id="${s.id}" data-class="${s.classId}">
        <td>${s.id}</td>
        <td><strong>${UI.escapeHtml(s.name)}</strong></td>
        <td>${UI.escapeHtml(s.email)}</td>
        <td>${UI.getClassName(s.classId)}</td>
        <td>${s.phone}</td>
        <td>${UI.statusBadge(s.status)}</td>
        ${isAdmin ? `<td class="table-actions">
          <button class="btn btn-ghost btn-sm edit-student" data-id="${s.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-student" data-id="${s.id}">Delete</button>
        </td>` : ''}
      </tr>
    `).join('');
  },

  bindEvents() {
    const search = document.getElementById('student-search');
    const filter = document.getElementById('student-class-filter');
    const filterRows = () => {
      const q = search.value.toLowerCase();
      const cls = filter.value;
      document.querySelectorAll('#students-table tbody tr[data-id]').forEach(row => {
        const matchSearch = row.textContent.toLowerCase().includes(q);
        const matchClass = !cls || row.dataset.class === cls;
        row.style.display = matchSearch && matchClass ? '' : 'none';
      });
    };
    search?.addEventListener('input', filterRows);
    filter?.addEventListener('change', filterRows);

    document.getElementById('add-student-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-student').forEach(btn =>
      btn.addEventListener('click', () => this.showForm(btn.dataset.id))
    );
    document.querySelectorAll('.delete-student').forEach(btn =>
      btn.addEventListener('click', () => this.delete(btn.dataset.id))
    );
  },

  showForm(id) {
    const students = Storage.getStudents();
    const classes = Storage.getClasses();
    const s = id ? students.find(x => x.id === id) : null;

    const body = `
      <form id="student-form">
        <div class="form-row">
          <div class="form-group"><label>Full Name *</label><input name="name" value="${s?.name || ''}" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" value="${s?.email || ''}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input name="phone" value="${s?.phone || ''}"></div>
          <div class="form-group"><label>Date of Birth</label><input type="date" name="dob" value="${s?.dob || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Gender</label>
            <select name="gender"><option value="">—</option>
              ${['Male','Female','Other'].map(g => `<option value="${g}" ${s?.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Class *</label>
            <select name="classId" required>
              <option value="">Select class</option>
              ${classes.map(c => `<option value="${c.id}" ${s?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Address</label><input name="address" value="${s?.address || ''}"></div>
        <div class="form-row">
          <div class="form-group"><label>Parent Name</label><input name="parentName" value="${s?.parentName || ''}"></div>
          <div class="form-group"><label>Parent Phone</label><input name="parentPhone" value="${s?.parentPhone || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Admission Date</label><input type="date" name="admissionDate" value="${s?.admissionDate || new Date().toISOString().slice(0,10)}"></div>
          <div class="form-group"><label>Status</label>
            <select name="status">
              ${['Active','Inactive'].map(st => `<option value="${st}" ${s?.status === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
        </div>
      </form>
    `;
    UI.showModal(id ? 'Edit Student' : 'Add Student', body, `
      <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Save</button>
    `);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('student-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const students = Storage.getStudents();
    const entry = {
      name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
      dob: fd.get('dob'), gender: fd.get('gender'), classId: fd.get('classId'),
      address: fd.get('address'), parentName: fd.get('parentName'),
      parentPhone: fd.get('parentPhone'), admissionDate: fd.get('admissionDate'),
      status: fd.get('status')
    };
    if (id) {
      const idx = students.findIndex(s => s.id === id);
      students[idx] = { ...students[idx], ...entry };
    } else {
      students.push({ id: Storage.nextId('STU', students), ...entry });
    }
    Storage.updateCollection('students', students);
    UI.hideModal();
    UI.toast(id ? 'Student updated' : 'Student added');
    Router.navigate('students');
  },

  delete(id) {
    UI.confirm('Delete this student?', () => {
      Storage.updateCollection('students', Storage.getStudents().filter(s => s.id !== id));
      UI.toast('Student deleted');
      Router.navigate('students');
    });
  }
};
