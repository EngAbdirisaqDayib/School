const GradesPage = {
  render() {
    const session = Auth.getSession();
    let grades = Storage.getGrades();
    if (session.role === 'student') {
      grades = grades.filter(g => g.studentId === session.linkedId);
    }
    const isStaff = session.role === 'admin' || session.role === 'teacher';

    return `
      <div class="toolbar">
        ${isStaff ? '<button class="btn btn-primary" id="add-grade-btn">+ Add Grade</button>' : ''}
        <input type="text" class="search-input" id="grade-search" placeholder="Search...">
      </div>
      <div class="card">
        <div class="card-body table-wrap">
          <table id="grades-table">
            <thead>
              <tr>
                ${session.role !== 'student' ? '<th>Student</th>' : ''}
                <th>Subject</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Date</th>
                ${isStaff ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${grades.length ? grades.map(g => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                const letter = UI.gradeLetter(pct);
                return `<tr data-id="${g.id}">
                  ${session.role !== 'student' ? `<td>${UI.getStudentName(g.studentId)}</td>` : ''}
                  <td>${UI.getSubjectName(g.subjectId)}</td>
                  <td>${UI.escapeHtml(g.exam)}</td>
                  <td>${g.score} / ${g.maxScore}</td>
                  <td>${pct}%</td>
                  <td>${UI.badge(letter, pct >= 70 ? 'success' : pct >= 60 ? 'warning' : 'danger')}</td>
                  <td>${UI.formatDate(g.date)}</td>
                  ${isStaff ? `<td class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-grade" data-id="${g.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-grade" data-id="${g.id}">Delete</button>
                  </td>` : ''}
                </tr>`;
              }).join('') : `<tr><td colspan="8">${UI.emptyState('📝', 'No grades recorded')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('grade-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#grades-table tbody tr[data-id]').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    document.getElementById('add-grade-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-grade').forEach(b => b.addEventListener('click', () => this.showForm(b.dataset.id)));
    document.querySelectorAll('.delete-grade').forEach(b => b.addEventListener('click', () => this.delete(b.dataset.id)));
  },

  showForm(id) {
    const grades = Storage.getGrades();
    const students = Storage.getStudents();
    const subjects = Storage.getSubjects();
    const g = id ? grades.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Grade' : 'Add Grade', `
      <form id="grade-form">
        <div class="form-group"><label>Student *</label>
          <select name="studentId" required><option value="">—</option>
            ${students.map(s => `<option value="${s.id}" ${g?.studentId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Subject *</label>
          <select name="subjectId" required><option value="">—</option>
            ${subjects.map(s => `<option value="${s.id}" ${g?.subjectId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Exam Type *</label>
          <input name="exam" value="${g?.exam || ''}" required placeholder="Mid-Term, Final, Quiz...">
        </div>
        <div class="form-row">
          <div class="form-group"><label>Score *</label><input type="number" name="score" value="${g?.score ?? ''}" required min="0"></div>
          <div class="form-group"><label>Max Score *</label><input type="number" name="maxScore" value="${g?.maxScore ?? 100}" required min="1"></div>
        </div>
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${g?.date || new Date().toISOString().slice(0,10)}"></div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('grade-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const grades = Storage.getGrades();
    const entry = {
      studentId: fd.get('studentId'), subjectId: fd.get('subjectId'), exam: fd.get('exam'),
      score: parseFloat(fd.get('score')), maxScore: parseFloat(fd.get('maxScore')), date: fd.get('date')
    };
    if (id) {
      const idx = grades.findIndex(g => g.id === id);
      grades[idx] = { ...grades[idx], ...entry };
    } else {
      grades.push({ id: Storage.nextId('GRD', grades), ...entry });
    }
    Storage.updateCollection('grades', grades);
    UI.hideModal();
    UI.toast('Grade saved');
    Router.navigate('grades');
  },

  delete(id) {
    UI.confirm('Delete this grade?', () => {
      Storage.updateCollection('grades', Storage.getGrades().filter(g => g.id !== id));
      UI.toast('Grade deleted');
      Router.navigate('grades');
    });
  }
};
