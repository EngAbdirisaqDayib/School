const AnnouncementsPage = {
  render() {
    const session = Auth.getSession();
    const announcements = Storage.getAnnouncements().sort((a, b) => new Date(b.date) - new Date(a.date));
    const canPost = session.role === 'admin' || session.role === 'teacher';

    return `
      ${canPost ? `<div class="toolbar"><button class="btn btn-primary" id="add-announcement-btn">+ New Announcement</button></div>` : ''}
      <div class="card-list">
        ${announcements.length ? announcements.map(a => `
          <div class="card" style="margin-bottom:1rem">
            <div class="card-header">
              <div>
                <h3 style="margin-bottom:.25rem">${UI.escapeHtml(a.title)}</h3>
                <span style="font-size:.8rem;color:var(--text-muted)">By ${UI.escapeHtml(a.author)} · ${UI.formatDate(a.date)} · ${a.audience}</span>
              </div>
              <div style="display:flex;gap:.5rem;align-items:center">
                ${UI.badge(a.priority, a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'info')}
                ${canPost ? `
                  <button class="btn btn-ghost btn-sm edit-ann" data-id="${a.id}">Edit</button>
                  <button class="btn btn-danger btn-sm delete-ann" data-id="${a.id}">Delete</button>
                ` : ''}
              </div>
            </div>
            <div class="card-body"><p>${UI.escapeHtml(a.content)}</p></div>
          </div>
        `).join('') : UI.emptyState('📢', 'No announcements yet')}
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('add-announcement-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-ann').forEach(b => b.addEventListener('click', () => this.showForm(b.dataset.id)));
    document.querySelectorAll('.delete-ann').forEach(b => b.addEventListener('click', () => this.delete(b.dataset.id)));
  },

  showForm(id) {
    const announcements = Storage.getAnnouncements();
    const session = Auth.getSession();
    const a = id ? announcements.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Announcement' : 'New Announcement', `
      <form id="ann-form">
        <div class="form-group"><label>Title *</label><input name="title" value="${a?.title || ''}" required></div>
        <div class="form-group"><label>Content *</label><textarea name="content" rows="4" required>${a?.content || ''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Priority</label>
            <select name="priority">${['Low','Medium','High'].map(p => `<option ${a?.priority === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Audience</label>
            <select name="audience">${['All','Students','Parents','Teachers'].map(au => `<option ${a?.audience === au ? 'selected' : ''}>${au}</option>`).join('')}</select>
          </div>
        </div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Publish</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id, session.name);
  },

  save(id, authorName) {
    const form = document.getElementById('ann-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const announcements = Storage.getAnnouncements();
    const entry = {
      title: fd.get('title'), content: fd.get('content'),
      priority: fd.get('priority'), audience: fd.get('audience'),
      date: new Date().toISOString().slice(0, 10), author: authorName
    };
    if (id) {
      const idx = announcements.findIndex(a => a.id === id);
      announcements[idx] = { ...announcements[idx], ...entry, date: announcements[idx].date };
    } else {
      announcements.push({ id: Storage.nextId('ANN', announcements), ...entry });
    }
    Storage.updateCollection('announcements', announcements);
    UI.hideModal();
    UI.toast('Announcement published');
    Router.navigate('announcements');
  },

  delete(id) {
    UI.confirm('Delete this announcement?', () => {
      Storage.updateCollection('announcements', Storage.getAnnouncements().filter(a => a.id !== id));
      UI.toast('Announcement deleted');
      Router.navigate('announcements');
    });
  }
};
