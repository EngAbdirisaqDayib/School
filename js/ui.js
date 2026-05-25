const UI = {
  showModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },

  confirm(message, onConfirm) {
    this.showModal('Confirm', `<p>${message}</p>`, `
      <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
      <button class="btn btn-danger" id="modal-confirm">Confirm</button>
    `);
    document.getElementById('modal-cancel').onclick = () => this.hideModal();
    document.getElementById('modal-confirm').onclick = () => { this.hideModal(); onConfirm(); };
  },

  badge(text, type = 'info') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  emptyState(icon, message) {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${message}</p></div>`;
  },

  getClassName(classId) {
    const cls = Storage.getClasses().find(c => c.id === classId);
    return cls ? cls.name : '—';
  },

  getStudentName(studentId) {
    const s = Storage.getStudents().find(x => x.id === studentId);
    return s ? s.name : '—';
  },

  getTeacherName(teacherId) {
    const t = Storage.getTeachers().find(x => x.id === teacherId);
    return t ? t.name : '—';
  },

  getSubjectName(subjectId) {
    const s = Storage.getSubjects().find(x => x.id === subjectId);
    return s ? s.name : '—';
  },

  statusBadge(status) {
    const map = { Active: 'success', Paid: 'success', Pending: 'warning', Overdue: 'danger', Inactive: 'danger' };
    return this.badge(status, map[status] || 'info');
  },

  gradeLetter(pct) {
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  },

  formatDate(d) {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
