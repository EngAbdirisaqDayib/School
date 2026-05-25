const FeesPage = {
  render() {
    const session = Auth.getSession();
    let fees = Storage.getFees();
    if (session.role === 'student') {
      fees = fees.filter(f => f.studentId === session.linkedId);
    }
    const isAdmin = session.role === 'admin';
    const totalPending = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);
    const totalPaid = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);

    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">$${totalPaid.toLocaleString()}</div><div class="stat-label">Paid</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">⏳</div><div><div class="stat-value">$${totalPending.toLocaleString()}</div><div class="stat-label">Outstanding</div></div></div>
      </div>
      ${isAdmin ? `<div class="toolbar"><button class="btn btn-primary" id="add-fee-btn">+ Add Fee Record</button></div>` : ''}
      <div class="card">
        <div class="card-body table-wrap">
          <table>
            <thead>
              <tr>
                ${session.role !== 'student' ? '<th>Student</th>' : ''}
                <th>Type</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th>${isAdmin ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${fees.length ? fees.map(f => `
                <tr>
                  ${session.role !== 'student' ? `<td>${UI.getStudentName(f.studentId)}</td>` : ''}
                  <td>${f.type}</td><td>$${f.amount.toLocaleString()}</td>
                  <td>${UI.formatDate(f.dueDate)}</td><td>${UI.formatDate(f.paidDate)}</td>
                  <td>${UI.statusBadge(f.status)}</td>
                  ${isAdmin ? `<td class="table-actions">
                    ${f.status !== 'Paid' ? `<button class="btn btn-success btn-sm mark-paid" data-id="${f.id}">Mark Paid</button>` : ''}
                    <button class="btn btn-ghost btn-sm edit-fee" data-id="${f.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-fee" data-id="${f.id}">Delete</button>
                  </td>` : ''}
                </tr>
              `).join('') : `<tr><td colspan="7">${UI.emptyState('💰', 'No fee records')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('add-fee-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-fee').forEach(b => b.addEventListener('click', () => this.showForm(b.dataset.id)));
    document.querySelectorAll('.delete-fee').forEach(b => b.addEventListener('click', () => this.delete(b.dataset.id)));
    document.querySelectorAll('.mark-paid').forEach(b => b.addEventListener('click', () => this.markPaid(b.dataset.id)));
  },

  showForm(id) {
    const fees = Storage.getFees();
    const students = Storage.getStudents();
    const f = id ? fees.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Fee' : 'Add Fee', `
      <form id="fee-form">
        <div class="form-group"><label>Student *</label>
          <select name="studentId" required>${students.map(s => `<option value="${s.id}" ${f?.studentId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Fee Type *</label>
            <select name="type">${['Tuition','Library','Lab','Transport','Other'].map(t => `<option ${f?.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Amount ($) *</label><input type="number" name="amount" value="${f?.amount || ''}" required min="0"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Due Date</label><input type="date" name="dueDate" value="${f?.dueDate || ''}"></div>
          <div class="form-group"><label>Status</label>
            <select name="status">${['Pending','Paid','Overdue'].map(s => `<option ${f?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('fee-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const fees = Storage.getFees();
    const entry = {
      studentId: fd.get('studentId'), type: fd.get('type'), amount: parseFloat(fd.get('amount')),
      dueDate: fd.get('dueDate'), status: fd.get('status'),
      paidDate: fd.get('status') === 'Paid' ? new Date().toISOString().slice(0, 10) : null
    };
    if (id) {
      const idx = fees.findIndex(f => f.id === id);
      fees[idx] = { ...fees[idx], ...entry };
    } else {
      fees.push({ id: Storage.nextId('FEE', fees), ...entry, paidDate: entry.status === 'Paid' ? entry.paidDate : null });
    }
    Storage.updateCollection('fees', fees);
    UI.hideModal();
    UI.toast('Fee saved');
    Router.navigate('fees');
  },

  markPaid(id) {
    const fees = Storage.getFees();
    const idx = fees.findIndex(f => f.id === id);
    fees[idx].status = 'Paid';
    fees[idx].paidDate = new Date().toISOString().slice(0, 10);
    Storage.updateCollection('fees', fees);
    UI.toast('Marked as paid');
    Router.navigate('fees');
  },

  delete(id) {
    UI.confirm('Delete this fee record?', () => {
      Storage.updateCollection('fees', Storage.getFees().filter(f => f.id !== id));
      UI.toast('Fee deleted');
      Router.navigate('fees');
    });
  }
};
