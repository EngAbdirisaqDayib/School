const Router = {
  pages: {
    dashboard: DashboardPage,
    students: StudentsPage,
    teachers: TeachersPage,
    classes: ClassesPage,
    subjects: SubjectsPage,
    attendance: AttendancePage,
    grades: GradesPage,
    timetable: TimetablePage,
    fees: FeesPage,
    announcements: AnnouncementsPage,
    reports: ReportsPage
  },

  titles: {
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    subjects: 'Subjects',
    attendance: 'Attendance',
    grades: 'Grades & Exams',
    timetable: 'Timetable',
    fees: 'Fee Management',
    announcements: 'Announcements',
    reports: 'Reports'
  },

  currentPage: 'dashboard',

  navigate(page) {
    if (!Auth.canAccess(page)) {
      UI.toast('Access denied', 'error');
      return;
    }
    this.currentPage = page;
    const Page = this.pages[page];
    if (!Page) return;

    document.getElementById('page-title').textContent = this.titles[page] || page;
    document.getElementById('main-content').innerHTML = Page.render();
    Page.bindEvents?.();

    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    document.getElementById('sidebar')?.classList.remove('open');
    location.hash = page;
  },

  init() {
    const page = location.hash.slice(1) || 'dashboard';
    const target = Auth.canAccess(page) ? page : 'dashboard';
    this.navigate(target);
  }
};
