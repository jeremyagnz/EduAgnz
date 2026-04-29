/* ============================================================
   EduAgnz – Main Application
   ============================================================ */

/* ── Session ── */
const Session = {
  KEY: 'eduagnz_session',
  get()        { try { return JSON.parse(sessionStorage.getItem(this.KEY)); } catch { return null; } },
  set(user)    { sessionStorage.setItem(this.KEY, JSON.stringify(user)); },
  clear()      { sessionStorage.removeItem(this.KEY); },
  isLoggedIn() { return !!this.get(); },
};

/* ── UI helpers ── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function show(el) { if (el) el.hidden = false; }
function hide(el) { if (el) el.hidden = true; }

function renderIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── Toast ── */
const TOAST_ICONS = {
  success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  error:   '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
};

function toast(msg, type = 'info') {
  const container = $('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;

  const iconDiv = document.createElement('div');
  iconDiv.className = 'toast-icon';
  iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${TOAST_ICONS[type] || TOAST_ICONS.info}</svg>`;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'toast-msg';
  msgDiv.textContent = msg;

  t.appendChild(iconDiv);
  t.appendChild(msgDiv);
  container.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

/* ── Date helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T23:59:59') < new Date();
}

function daysLeft(dateStr) {
  const diff = new Date(dateStr + 'T23:59:59') - new Date();
  return Math.ceil(diff / 86400000);
}

function dueBadge(dateStr) {
  if (!dateStr) return '';
  const d = daysLeft(dateStr);
  if (d < 0)   return `<span class="badge badge-red">Vencida</span>`;
  if (d === 0) return `<span class="badge badge-amber">Vence hoy</span>`;
  if (d <= 3)  return `<span class="badge badge-amber">${d}d restantes</span>`;
  return `<span class="badge badge-gray">${formatDate(dateStr)}</span>`;
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fileAttachmentHtml(sub) {
  if (!sub?.fileName) return '';
  const label = escHtml(sub.fileName) + (sub.fileSize ? ` <span style="opacity:.65">(${formatFileSize(sub.fileSize)})</span>` : '');
  if (sub.fileData) {
    return `<a class="file-attachment" href="${sub.fileData}" download="${escHtml(sub.fileName)}" title="Descargar ${escHtml(sub.fileName)}">${icon('paperclip',12)} ${label}</a>`;
  }
  return `<div class="file-attachment">${icon('paperclip',12)} ${label}</div>`;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── SVG icon helper ── */
const ICONS = {
  home:        '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  book:        '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  clipboard:   '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>',
  inbox:       '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  users:       '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  send:        '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  edit:        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:       '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  eye:         '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  award:       '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  copy:        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  chevron:     '<polyline points="9 18 15 12 9 6"/>',
  plus:        '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check:       '<polyline points="20 6 9 17 4 12"/>',
  clock:       '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  alert:       '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
};

function icon(name, size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

/* ── Modal ── */
const Modal = {
  currentId: null,
  open(id) {
    Modal.close();
    const overlay = $('#modal-overlay');
    const modal   = $(`#modal-${id}`);
    if (!overlay || !modal) return;
    overlay.classList.add('open');
    modal.classList.add('open');
    Modal.currentId = id;
  },
  close() {
    $$('.modal.open').forEach(m => m.classList.remove('open'));
    $('#modal-overlay')?.classList.remove('open');
    Modal.currentId = null;
  },
};

/* ── Navigation ── */
const Nav = {
  currentView: null,

  go(viewId, data = {}) {
    $$('.view').forEach(v => v.classList.remove('active'));
    const view = $(`#view-${viewId}`);
    if (!view) return;
    view.classList.add('active');
    Nav.currentView = viewId;

    // Hash routing
    history.replaceState({ viewId, data }, '', '#' + viewId);

    // Update sidebar highlights
    $$('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewId);
    });

    // Render view
    const renderer = ViewRenderers[viewId];
    if (renderer) renderer(data);

    // Scroll to top
    $('#main-content')?.scrollTo(0, 0);
  },
};

/* ── Topbar ── */
function setTopbar(title, subtitle = '') {
  const el  = $('#topbar-title');
  const sub = $('#topbar-subtitle');
  if (el)  el.textContent = title;
  if (sub) {
    sub.textContent = subtitle;
    sub.style.display = subtitle ? '' : 'none';
  }
}

/* ── Sidebar ── */
function buildSidebar(user) {
  const sidebarUser   = $('#sidebar-user-name');
  const sidebarRole   = $('#sidebar-user-role');
  const sidebarAvatar = $('#sidebar-avatar');
  const topbarAvatar  = $('#topbar-avatar');
  const topbarName    = $('#topbar-user-name');

  const initStr = initials(user.name);
  if (sidebarUser)   sidebarUser.textContent  = user.name;
  if (sidebarRole)   sidebarRole.textContent  = user.role === 'teacher' ? 'Profesor/a' : 'Estudiante';
  if (sidebarAvatar) sidebarAvatar.textContent = initStr;
  if (topbarAvatar)  topbarAvatar.textContent  = initStr;
  if (topbarName)    topbarName.textContent    = user.name.split(' ')[0];

  const nav = $('#sidebar-nav');
  if (!nav) return;

  if (user.role === 'teacher') {
    nav.innerHTML = `
      <div class="sidebar-section-title">Principal</div>
      <button class="nav-item" data-view="teacher-overview">
        ${icon('home', 18)} Inicio
      </button>
      <div class="sidebar-section-title">Gestión Académica</div>
      <button class="nav-item" data-view="teacher-courses">
        ${icon('book', 18)} Mis Cursos
      </button>
      <button class="nav-item" data-view="teacher-assignments">
        ${icon('clipboard', 18)} Tareas
      </button>
      <button class="nav-item" data-view="teacher-submissions">
        ${icon('inbox', 18)} Entregas
      </button>`;
  } else {
    nav.innerHTML = `
      <div class="sidebar-section-title">Principal</div>
      <button class="nav-item" data-view="student-overview">
        ${icon('home', 18)} Inicio
      </button>
      <div class="sidebar-section-title">Mi Actividad</div>
      <button class="nav-item" data-view="student-courses">
        ${icon('book', 18)} Mis Cursos
      </button>
      <button class="nav-item" data-view="student-assignments">
        ${icon('clipboard', 18)} Tareas
      </button>
      <button class="nav-item" data-view="student-my-submissions">
        ${icon('send', 18)} Mis Entregas
      </button>`;
  }

  $$('.nav-item', nav).forEach(btn => {
    btn.addEventListener('click', () => {
      Nav.go(btn.dataset.view);
      $('#sidebar')?.classList.remove('open');
      $('#sidebar-backdrop')?.classList.remove('show');
    });
  });
}

/* ============================================================
   VIEW RENDERERS
   ============================================================ */
const ViewRenderers = {};

/* ── TEACHER OVERVIEW ── */
ViewRenderers['teacher-overview'] = function() {
  const user      = Session.get();
  const firstName = user.name.split(' ')[0];
  const myCourses = DB.courses.byTeacher(user.id);
  const myAsgns   = DB.assignments.byTeacher(user.id);
  const allSubs   = DB.submissions.all().filter(s => myAsgns.some(a => a.id === s.assignmentId));
  const ungraded  = allSubs.filter(s => s.grade === null);

  setTopbar('Inicio');

  // Update page header
  const phTitle = $('#ph-title-teacher-overview');
  const phSub   = $('#ph-sub-teacher-overview');
  if (phTitle) phTitle.textContent = `Bienvenido, ${firstName}`;
  if (phSub)   phSub.textContent   = `Aquí tienes un resumen de tu actividad`;

  $('#teacher-stat-courses').textContent  = myCourses.length;
  $('#teacher-stat-asgns').textContent    = myAsgns.length;
  $('#teacher-stat-subs').textContent     = allSubs.length;
  $('#teacher-stat-ungraded').textContent = ungraded.length;

  const recent    = [...myAsgns].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const container = $('#teacher-recent-asgns');
  if (!container) return;

  if (!recent.length) {
    container.innerHTML = emptyState('clipboard', 'Sin tareas aún', 'Crea tu primer curso y añade tareas para empezar.');
    return;
  }

  container.innerHTML = recent.map(a => {
    const course  = DB.courses.byId(a.courseId);
    const subs    = DB.submissions.byAssignment(a.id);
    const enrolled = (course?.studentIds || []).length;
    return asgnCard(a, course, subs, enrolled, 'teacher');
  }).join('');
};

/* ── TEACHER COURSES ── */
ViewRenderers['teacher-courses'] = function() {
  const user      = Session.get();
  const myCourses = DB.courses.byTeacher(user.id);
  const grid      = $('#teacher-courses-grid');
  if (!grid) return;
  setTopbar('Mis Cursos');

  if (!myCourses.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${emptyStateInner('book', 'Sin cursos todavía', 'Crea tu primer curso para comenzar a gestionar tareas y estudiantes.', `<button class="btn btn-primary" onclick="openCourseModal()">Crear primer curso</button>`)}</div>`;
    return;
  }

  grid.innerHTML = myCourses.map(c => courseCard(c, 'teacher')).join('');
};

/* ── TEACHER COURSE DETAIL ── */
ViewRenderers['teacher-course-detail'] = function({ id }) {
  const course = DB.courses.byId(id);
  if (!course) { Nav.go('teacher-courses'); return; }

  window._currentCourseDetailId = id;
  setTopbar(course.name);

  // Page header
  const bcEl   = $('#tc-breadcrumb');
  const titleEl= $('#tc-ph-title');
  const subEl  = $('#tc-ph-sub');
  const actEl  = $('#tc-ph-actions');

  if (bcEl) bcEl.innerHTML = `
    <span class="bc-item" onclick="Nav.go('teacher-courses')">Mis Cursos</span>
    <span class="bc-sep">${icon('chevron', 12)}</span>
    <span class="bc-item current">${escHtml(course.name)}</span>`;

  if (titleEl) titleEl.textContent = course.name;
  if (subEl)   subEl.textContent   = course.description || 'Sin descripción';
  if (actEl)   actEl.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="openCourseModal('${course.id}')">
      ${icon('edit', 14)} Editar
    </button>`;

  // Enroll code
  const codeEl = $('#teacher-enroll-code');
  if (codeEl) codeEl.innerHTML = `
    <div class="enroll-code-display">
      <span class="enroll-code-text">${escHtml(course.code)}</span>
      <button class="btn btn-secondary btn-sm" onclick="copyCode('${escHtml(course.code)}')">
        ${icon('copy', 14)} Copiar código
      </button>
    </div>
    <p style="color:var(--text-muted);font-size:.78rem;margin-top:.5rem">
      Comparte este código con tus estudiantes para que se unan al curso.
    </p>`;

  renderTeacherCourseAssignments(id);
  renderCourseStudents(id);
};

function renderTeacherCourseAssignments(courseId) {
  const container = $('#teacher-course-assignments-list');
  if (!container) return;
  const asgns  = DB.assignments.byCourse(courseId);
  const course = DB.courses.byId(courseId);
  const enrolled = (course?.studentIds || []).length;

  if (!asgns.length) {
    container.innerHTML = emptyState('clipboard', 'Sin tareas', 'Crea la primera tarea para este curso.', `<button class="btn btn-primary" onclick="openAssignmentModal(null, '${courseId}')">Nueva Tarea</button>`);
    return;
  }

  container.innerHTML = asgns.map(a => {
    const subs = DB.submissions.byAssignment(a.id);
    return asgnCard(a, course, subs, enrolled, 'teacher', courseId);
  }).join('');
}

function renderCourseStudents(courseId) {
  const container = $('#teacher-course-students-list');
  if (!container) return;
  const course    = DB.courses.byId(courseId);
  const studentIds = course?.studentIds || [];

  if (!studentIds.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;padding:1rem 0">Aún no hay estudiantes inscritos. Comparte el código del curso para que se unan.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Correo</th>
            <th>Entregas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${studentIds.map(sid => {
            const s    = DB.users.byId(sid);
            if (!s) return '';
            const asgns = DB.assignments.byCourse(courseId);
            const subs  = asgns.reduce((acc, a) => acc + (DB.submissions.get(a.id, sid) ? 1 : 0), 0);
            const pct   = asgns.length ? Math.round((subs / asgns.length) * 100) : 0;
            return `<tr>
              <td>
                <div style="display:flex;align-items:center;gap:.6rem">
                  <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#6366F1);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0">${initials(s.name)}</div>
                  <strong>${escHtml(s.name)}</strong>
                </div>
              </td>
              <td style="color:var(--text-muted)">${escHtml(s.email)}</td>
              <td>
                <div style="display:flex;align-items:center;gap:.6rem">
                  <div class="progress-bar-wrap" style="width:80px">
                    <div class="progress-bar" style="width:${pct}%"></div>
                  </div>
                  <span style="font-size:.8rem;color:var(--text-muted)">${subs}/${asgns.length}</span>
                </div>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="removeStudent('${courseId}','${sid}')">
                  ${icon('trash', 14)} Eliminar
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── TEACHER ALL ASSIGNMENTS ── */
ViewRenderers['teacher-assignments'] = function() {
  const user      = Session.get();
  const asgns     = DB.assignments.byTeacher(user.id);
  const container = $('#teacher-assignments-list');
  if (!container) return;
  setTopbar('Tareas');

  if (!asgns.length) {
    container.innerHTML = emptyState('clipboard', 'Sin tareas', 'Ve a un curso y crea tu primera tarea.',
      `<button class="btn btn-primary" onclick="Nav.go('teacher-courses')">Ir a Mis Cursos</button>`);
    return;
  }

  const sorted = [...asgns].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  container.innerHTML = sorted.map(a => {
    const course  = DB.courses.byId(a.courseId);
    const subs    = DB.submissions.byAssignment(a.id);
    const enrolled = (course?.studentIds || []).length;
    return asgnCard(a, course, subs, enrolled, 'teacher');
  }).join('');
};

/* ── TEACHER ASSIGNMENT DETAIL ── */
ViewRenderers['teacher-assignment-detail'] = function({ id }) {
  const asgn = DB.assignments.byId(id);
  if (!asgn) { Nav.go('teacher-assignments'); return; }
  const course = DB.courses.byId(asgn.courseId);
  setTopbar(asgn.title);

  // Page header
  const bcEl   = $('#ta-breadcrumb');
  const titleEl= $('#ta-ph-title');
  const subEl  = $('#ta-ph-sub');
  const actEl  = $('#ta-ph-actions');

  if (bcEl) bcEl.innerHTML = `
    <span class="bc-item" onclick="Nav.go('teacher-course-detail', {id:'${asgn.courseId}'})">
      ${escHtml(course?.name || 'Curso')}
    </span>
    <span class="bc-sep">${icon('chevron', 12)}</span>
    <span class="bc-item current">${escHtml(asgn.title)}</span>`;

  if (titleEl) titleEl.textContent = asgn.title;
  if (subEl)   subEl.textContent   = course?.name || '';
  if (actEl)   actEl.innerHTML = `
    <button class="btn btn-secondary btn-sm" onclick="openAssignmentModal('${asgn.id}')">
      ${icon('edit', 14)} Editar
    </button>
    <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${asgn.id}')">
      ${icon('trash', 14)} Eliminar
    </button>`;

  // Assignment info card
  const info = $('#teacher-asgn-info');
  if (info) info.innerHTML = `
    <div class="detail-card">
      <div style="display:flex;align-items:flex-start;gap:.8rem">
        <div style="width:44px;height:44px;border-radius:10px;background:var(--warning-light);color:var(--warning);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${icon('clipboard', 20)}
        </div>
        <div style="flex:1">
          <div class="detail-title" style="font-size:1.1rem">${escHtml(asgn.title)}</div>
          <span class="badge badge-purple">${escHtml(course?.name || '')}</span>
        </div>
      </div>
      <div class="detail-body" style="margin-top:1rem">${escHtml(asgn.description || 'Sin descripción.')}</div>
      <div class="detail-meta-row">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Fecha límite</span>
          <span class="detail-meta-value">${formatDate(asgn.dueDate)}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Puntos</span>
          <span class="detail-meta-value">${asgn.points} pts</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Estado</span>
          <span class="detail-meta-value">
            ${isOverdue(asgn.dueDate)
              ? `<span class="badge badge-red" aria-label="Estado: Vencida">${icon('alert',12)} Vencida</span>`
              : `<span class="badge badge-green" aria-label="Estado: Activa">${icon('check',12)} Activa</span>`}
          </span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Creada</span>
          <span class="detail-meta-value">${formatDate(asgn.createdAt?.slice(0,10))}</span>
        </div>
      </div>
    </div>`;

  // Submissions list
  const container = $('#teacher-asgn-submissions');
  if (!container) return;
  const subs     = DB.submissions.byAssignment(id);
  const enrolled = course?.studentIds || [];

  if (!enrolled.length) {
    container.innerHTML = emptyState('users', 'Sin estudiantes', 'No hay estudiantes inscritos en este curso.');
    return;
  }

  container.innerHTML = enrolled.map(sid => {
    const student = DB.users.byId(sid);
    if (!student) return '';
    const sub = DB.submissions.get(id, sid);

    if (!sub) {
      return `
        <div class="submission-box">
          <div class="submission-header">
            <div style="display:flex;align-items:center;gap:.6rem">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#6366F1);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#fff;flex-shrink:0">${initials(student.name)}</div>
              <div>
                <div class="submission-student">${escHtml(student.name)}</div>
                <div class="submission-date">${escHtml(student.email)}</div>
              </div>
            </div>
            <span class="badge badge-gray">${icon('clock', 12)} Sin entregar</span>
          </div>
        </div>`;
    }

    const gradeHtml = sub.grade !== null
      ? `<div class="grade-display">${icon('award', 14)} ${sub.grade} / ${asgn.points} pts</div>`
      : `<span class="badge badge-amber">Sin calificar</span>`;

    return `
      <div class="submission-box">
        <div class="submission-header">
          <div style="display:flex;align-items:center;gap:.6rem">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#059669,#10B981);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#fff;flex-shrink:0">${initials(student.name)}</div>
            <div>
              <div class="submission-student">${escHtml(student.name)}</div>
              <div class="submission-date">Enviado: ${formatDateTime(sub.submittedAt)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            ${gradeHtml}
            <button class="btn btn-sm btn-primary" onclick="openGradeModal('${sub.id}', ${asgn.points})">
              ${sub.grade !== null ? icon('edit',14)+' Editar nota' : icon('award',14)+' Calificar'}
            </button>
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${fileAttachmentHtml(sub)}
        ${sub.feedback ? `<div class="feedback-block"><div class="feedback-label">Retroalimentación</div>${escHtml(sub.feedback)}</div>` : ''}
      </div>`;
  }).join('');
};

/* ── TEACHER ALL SUBMISSIONS ── */
ViewRenderers['teacher-submissions'] = function() {
  const user    = Session.get();
  const myAsgns = DB.assignments.byTeacher(user.id);
  const allSubs = DB.submissions.all().filter(s => myAsgns.some(a => a.id === s.assignmentId));
  const container = $('#teacher-all-submissions');
  if (!container) return;
  setTopbar('Entregas');

  if (!allSubs.length) {
    container.innerHTML = emptyState('inbox', 'Sin entregas', 'Tus estudiantes aún no han entregado tareas.');
    return;
  }

  const sorted = [...allSubs].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  container.innerHTML = `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Tarea</th>
            <th>Curso</th>
            <th>Enviada</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(sub => {
            const student = DB.users.byId(sub.studentId);
            const asgn    = DB.assignments.byId(sub.assignmentId);
            const course  = asgn ? DB.courses.byId(asgn.courseId) : null;
            return `<tr>
              <td>
                <div style="display:flex;align-items:center;gap:.5rem">
                  <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#6366F1);display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:700;color:#fff;flex-shrink:0">${initials(student?.name || '?')}</div>
                  <strong>${escHtml(student?.name || '?')}</strong>
                </div>
              </td>
              <td>${escHtml(asgn?.title || '?')}</td>
              <td><span class="badge badge-purple">${escHtml(course?.name || '?')}</span></td>
              <td style="color:var(--text-muted);font-size:.8rem">${formatDateTime(sub.submittedAt)}</td>
              <td>${sub.grade !== null
                ? `<span class="badge badge-green">${icon('check',12)} ${sub.grade}/${asgn?.points}</span>`
                : `<span class="badge badge-amber">${icon('clock',12)} Pendiente</span>`}
              </td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="Nav.go('teacher-assignment-detail',{id:'${sub.assignmentId}'})">
                  ${icon('eye',14)} Ver
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
};

/* ============================================================
   STUDENT VIEW RENDERERS
   ============================================================ */

/* ── STUDENT OVERVIEW ── */
ViewRenderers['student-overview'] = function() {
  const user      = Session.get();
  const firstName = user.name.split(' ')[0];
  const myCourses = DB.courses.byStudent(user.id);
  const allAsgns  = myCourses.flatMap(c => DB.assignments.byCourse(c.id));
  const mySubs    = DB.submissions.byStudent(user.id);
  const pending   = allAsgns.filter(a => !DB.submissions.get(a.id, user.id) && !isOverdue(a.dueDate));
  const graded    = mySubs.filter(s => s.grade !== null);

  setTopbar('Inicio');

  const phTitle = $('#ph-title-student-overview');
  const phSub   = $('#ph-sub-student-overview');
  if (phTitle) phTitle.textContent = `¡Hola, ${firstName}!`;
  if (phSub)   phSub.textContent   = 'Aquí tienes un resumen de tu actividad académica';

  $('#student-stat-courses').textContent  = myCourses.length;
  $('#student-stat-pending').textContent  = pending.length;
  $('#student-stat-subs').textContent     = mySubs.length;
  $('#student-stat-graded').textContent   = graded.length;

  const container = $('#student-upcoming-asgns');
  if (!container) return;

  const upcoming = allAsgns
    .filter(a => !isOverdue(a.dueDate))
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  if (!upcoming.length) {
    container.innerHTML = emptyState('check', '¡Todo al día!', 'No tienes tareas pendientes por el momento.');
    return;
  }

  container.innerHTML = upcoming.map(a => {
    const course = DB.courses.byId(a.courseId);
    const sub    = DB.submissions.get(a.id, user.id);
    return asgnCardStudent(a, course, sub, user.id);
  }).join('');
};

/* ── STUDENT COURSES ── */
ViewRenderers['student-courses'] = function() {
  const user      = Session.get();
  const myCourses = DB.courses.byStudent(user.id);
  const grid      = $('#student-courses-grid');
  if (!grid) return;
  setTopbar('Mis Cursos');

  if (!myCourses.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${emptyStateInner('book', 'Sin cursos inscritos', 'Usa el código que te dio tu profesor para unirte a un curso.', `<button class="btn btn-primary" onclick="openJoinModal()">Unirse a un Curso</button>`)}</div>`;
    return;
  }

  grid.innerHTML = myCourses.map(c => courseCard(c, 'student', user.id)).join('');
};

/* ── STUDENT COURSE DETAIL ── */
ViewRenderers['student-course-detail'] = function({ id }) {
  const user   = Session.get();
  const course = DB.courses.byId(id);
  if (!course) { Nav.go('student-courses'); return; }
  setTopbar(course.name);

  const bcEl   = $('#sc-breadcrumb');
  const titleEl= $('#sc-ph-title');
  const subEl  = $('#sc-ph-sub');

  if (bcEl) bcEl.innerHTML = `
    <span class="bc-item" onclick="Nav.go('student-courses')">Mis Cursos</span>
    <span class="bc-sep">${icon('chevron', 12)}</span>
    <span class="bc-item current">${escHtml(course.name)}</span>`;

  if (titleEl) titleEl.textContent = course.name;
  if (subEl)   subEl.textContent   = course.description || '';

  // Course info card
  const header = $('#student-course-header');
  if (header) {
    const teacher = DB.users.byId(course.teacherId);
    const asgns   = DB.assignments.byCourse(id);
    const pending = asgns.filter(a => !DB.submissions.get(a.id, user.id) && !isOverdue(a.dueDate)).length;
    header.innerHTML = `
      <div class="detail-card" style="margin-bottom:1.25rem">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <div style="flex:1">
            <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:.3rem">Docente responsable</div>
            <div style="font-weight:600">${escHtml(teacher?.name || 'Profesor')}</div>
          </div>
          <span class="badge badge-gray">${icon('users',12)} ${(course.studentIds||[]).length} estudiantes</span>
          <span class="badge badge-gray">${icon('clipboard',12)} ${asgns.length} tareas</span>
          ${pending > 0 ? `<span class="badge badge-amber">${icon('clock',12)} ${pending} pendientes</span>` : `<span class="badge badge-green">${icon('check',12)} Al día</span>`}
        </div>
      </div>`;
  }

  const container = $('#student-course-asgns');
  if (!container) return;
  const asgns = DB.assignments.byCourse(id);

  if (!asgns.length) {
    container.innerHTML = emptyState('clipboard', 'Sin tareas', 'El profesor aún no ha publicado tareas en este curso.');
    return;
  }

  container.innerHTML = asgns.map(a => {
    const sub = DB.submissions.get(a.id, user.id);
    return asgnCardStudent(a, course, sub, user.id, true);
  }).join('');
};

/* ── STUDENT ALL ASSIGNMENTS ── */
ViewRenderers['student-assignments'] = function() {
  const user      = Session.get();
  const myCourses = DB.courses.byStudent(user.id);
  const allAsgns  = myCourses.flatMap(c => DB.assignments.byCourse(c.id));
  const container = $('#student-assignments-list');
  if (!container) return;
  setTopbar('Tareas');

  if (!allAsgns.length) {
    container.innerHTML = emptyState('clipboard', 'Sin tareas', 'Inscríbete en un curso para ver las tareas.',
      `<button class="btn btn-primary" onclick="Nav.go('student-courses')">Ver Mis Cursos</button>`);
    return;
  }

  const sorted = [...allAsgns].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  container.innerHTML = sorted.map(a => {
    const course = DB.courses.byId(a.courseId);
    const sub    = DB.submissions.get(a.id, user.id);
    return asgnCardStudent(a, course, sub, user.id, true);
  }).join('');
};

/* ── STUDENT ASSIGNMENT DETAIL ── */
ViewRenderers['student-assignment-detail'] = function({ id }) {
  const user = Session.get();
  const asgn = DB.assignments.byId(id);
  if (!asgn) { Nav.go('student-assignments'); return; }
  const course = DB.courses.byId(asgn.courseId);
  const sub    = DB.submissions.get(id, user.id);
  setTopbar(asgn.title);

  // Page header
  const bcEl   = $('#sa-breadcrumb');
  const titleEl= $('#sa-ph-title');
  const subEl  = $('#sa-ph-sub');
  const actEl  = $('#sa-ph-actions');

  if (bcEl) bcEl.innerHTML = `
    <span class="bc-item" onclick="Nav.go('student-course-detail', {id:'${asgn.courseId}'})">
      ${escHtml(course?.name || 'Curso')}
    </span>
    <span class="bc-sep">${icon('chevron', 12)}</span>
    <span class="bc-item current">${escHtml(asgn.title)}</span>`;

  if (titleEl) titleEl.textContent = asgn.title;
  if (subEl)   subEl.textContent   = course?.name || '';
  if (actEl && !sub && !isOverdue(asgn.dueDate)) {
    actEl.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="openSubmitModal('${id}')">
        ${icon('send', 14)} Entregar Tarea
      </button>`;
  }

  // Assignment info card
  const info = $('#student-asgn-info');
  if (info) {
    const overdueAlert = isOverdue(asgn.dueDate) && !sub
      ? `<div class="alert alert-danger" style="margin-top:1rem">Esta tarea ya venció. Ya no puedes entregarla.</div>` : '';
    const statusBadge = sub
      ? sub.grade !== null
        ? `<span class="badge badge-green">${icon('check',12)} Calificada: ${sub.grade}/${asgn.points}</span>`
        : `<span class="badge badge-blue">${icon('send',12)} Entregada</span>`
      : isOverdue(asgn.dueDate)
        ? `<span class="badge badge-red">${icon('alert',12)} Vencida</span>`
        : `<span class="badge badge-amber">${icon('clock',12)} Pendiente</span>`;

    info.innerHTML = `
      <div class="detail-card">
        <div style="display:flex;align-items:flex-start;gap:.8rem">
          <div style="width:44px;height:44px;border-radius:10px;background:var(--warning-light);color:var(--warning);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${icon('clipboard', 20)}
          </div>
          <div style="flex:1">
            <div class="detail-title" style="font-size:1.1rem">${escHtml(asgn.title)}</div>
            <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.25rem">
              <span class="badge badge-purple">${escHtml(course?.name || '')}</span>
              ${statusBadge}
            </div>
          </div>
        </div>
        <div class="detail-body" style="margin-top:1rem">${escHtml(asgn.description || 'Sin descripción.')}</div>
        <div class="detail-meta-row">
          <div class="detail-meta-item">
            <span class="detail-meta-label">Fecha límite</span>
            <span class="detail-meta-value">${formatDate(asgn.dueDate)}</span>
          </div>
          <div class="detail-meta-item">
            <span class="detail-meta-label">Puntos</span>
            <span class="detail-meta-value">${asgn.points} pts</span>
          </div>
        </div>
        ${overdueAlert}
      </div>`;
  }

  // Submission section
  const subSection = $('#student-submission-section');
  if (!subSection) return;

  if (sub) {
    const gradeHtml = sub.grade !== null
      ? `<div class="alert alert-success" style="margin-top:1rem">
           <strong>${icon('award',16)} Calificación: ${sub.grade} / ${asgn.points} puntos</strong>
           ${sub.feedback ? `<div class="feedback-block" style="margin-top:.75rem"><div class="feedback-label">Retroalimentación del profesor</div>${escHtml(sub.feedback)}</div>` : ''}
         </div>`
      : `<div class="alert alert-info" style="margin-top:1rem">Tu entrega está siendo revisada por el profesor.</div>`;

    subSection.innerHTML = `
      <div class="detail-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
          <div style="font-size:.95rem;font-weight:700;display:flex;align-items:center;gap:.4rem">
            ${icon('send',16)} Mi Entrega
          </div>
          <div style="display:flex;gap:.4rem;align-items:center">
            <span style="font-size:.75rem;color:var(--text-muted)">${formatDateTime(sub.submittedAt)}</span>
            ${sub.grade === null
              ? `<button class="btn btn-sm btn-outline" onclick="openSubmitModal('${id}', true)">
                   ${icon('edit',13)} Re-entregar
                 </button>` : ''}
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${fileAttachmentHtml(sub)}
        ${gradeHtml}
      </div>`;
  } else if (!isOverdue(asgn.dueDate)) {
    subSection.innerHTML = `
      <div class="detail-card" style="text-align:center;padding:2rem">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
          ${icon('send', 24)}
        </div>
        <div style="font-weight:700;font-size:1rem;margin-bottom:.35rem">¿Listo para entregar?</div>
        <div style="font-size:.875rem;color:var(--text-muted);margin-bottom:1.25rem">Escribe tu respuesta y envíala antes de la fecha límite.</div>
        <button class="btn btn-primary btn-lg" onclick="openSubmitModal('${id}')">
          ${icon('send',16)} Entregar Tarea
        </button>
      </div>`;
  } else {
    subSection.innerHTML = `
      <div class="detail-card">
        <div class="alert alert-danger">Esta tarea venció sin entrega. No puedes entregarla.</div>
      </div>`;
  }
};

/* ── STUDENT MY SUBMISSIONS ── */
ViewRenderers['student-my-submissions'] = function() {
  const user  = Session.get();
  const subs  = DB.submissions.byStudent(user.id);
  const container = $('#student-my-subs-list');
  if (!container) return;
  setTopbar('Mis Entregas');

  if (!subs.length) {
    container.innerHTML = emptyState('send', 'Sin entregas todavía', 'Aún no has entregado ninguna tarea.');
    return;
  }

  const sorted = [...subs].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  container.innerHTML = sorted.map(sub => {
    const asgn   = DB.assignments.byId(sub.assignmentId);
    const course = asgn ? DB.courses.byId(asgn.courseId) : null;
    const gradeHtml = sub.grade !== null
      ? `<div class="grade-display">${icon('award',14)} ${sub.grade} / ${asgn?.points || '?'} pts</div>`
      : `<span class="badge badge-amber">${icon('clock',12)} Pendiente</span>`;

    return `
      <div class="submission-box">
        <div class="submission-header">
          <div>
            <div class="submission-student">${escHtml(asgn?.title || 'Tarea eliminada')}</div>
            <div class="submission-date">
              ${course ? `<span class="badge badge-purple" style="margin-right:.3rem">${escHtml(course.name)}</span>` : ''}
              Enviada: ${formatDateTime(sub.submittedAt)}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            ${gradeHtml}
            ${asgn ? `<button class="btn btn-sm btn-outline" onclick="Nav.go('student-assignment-detail',{id:'${asgn.id}'})">${icon('eye',13)} Ver</button>` : ''}
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${fileAttachmentHtml(sub)}
        ${sub.feedback ? `<div class="feedback-block"><div class="feedback-label">Retroalimentación</div>${escHtml(sub.feedback)}</div>` : ''}
      </div>`;
  }).join('');
};

/* ============================================================
   SHARED CARD TEMPLATES
   ============================================================ */

function courseCard(c, role, userId = null) {
  const asgns   = DB.assignments.byCourse(c.id);
  const enrolled = (c.studentIds || []).length;

  if (role === 'teacher') {
    const subs = asgns.reduce((acc, a) => acc + DB.submissions.byAssignment(a.id).length, 0);
    return `
      <div class="card" style="cursor:pointer" onclick="Nav.go('teacher-course-detail', {id:'${c.id}'})">
        <div class="card-cover ${c.color || 'color-blue'}">
          <span class="card-cover-code">${escHtml(c.code)}</span>
        </div>
        <div class="card-header">
          <div class="card-title">${escHtml(c.name)}</div>
          <div class="card-description">${escHtml(c.description || 'Sin descripción')}</div>
        </div>
        <div class="card-footer">
          <span class="badge badge-gray">${icon('users',12)} ${enrolled}</span>
          <span class="badge badge-gray">${icon('clipboard',12)} ${asgns.length}</span>
          <span class="badge badge-gray">${icon('inbox',12)} ${subs}</span>
          <div style="margin-left:auto;display:flex;gap:.3rem">
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openCourseModal('${c.id}')">
              ${icon('edit',13)}
            </button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteCourse('${c.id}')">
              ${icon('trash',13)}
            </button>
          </div>
        </div>
      </div>`;
  } else {
    const teacher = DB.users.byId(c.teacherId);
    const pending = userId ? asgns.filter(a => !DB.submissions.get(a.id, userId) && !isOverdue(a.dueDate)).length : 0;
    return `
      <div class="card" style="cursor:pointer" onclick="Nav.go('student-course-detail', {id:'${c.id}'})">
        <div class="card-cover ${c.color || 'color-blue'}">
          <span class="card-cover-code">${escHtml(c.code)}</span>
        </div>
        <div class="card-header">
          <div class="card-title">${escHtml(c.name)}</div>
          <div class="card-description">${escHtml(c.description || 'Sin descripción')}</div>
          <div style="margin-top:.5rem;font-size:.78rem;color:var(--text-muted)">
            ${icon('users',12)} ${escHtml(teacher?.name || '')}
          </div>
        </div>
        <div class="card-footer">
          <span class="badge badge-gray">${icon('clipboard',12)} ${asgns.length} tareas</span>
          ${pending > 0
            ? `<span class="badge badge-amber">${icon('clock',12)} ${pending} pendientes</span>`
            : `<span class="badge badge-green">${icon('check',12)} Al día</span>`}
        </div>
      </div>`;
  }
}

function asgnCard(a, course, subs, enrolled, role, courseId = null) {
  const ungraded = subs.filter(s => s.grade === null).length;
  return `
    <div class="assignment-card" style="cursor:pointer" onclick="Nav.go('teacher-assignment-detail', {id:'${a.id}'})">
      <div class="assignment-icon">${icon('clipboard', 18)}</div>
      <div class="assignment-body">
        <div class="assignment-title">${escHtml(a.title)}</div>
        ${course ? `<div class="assignment-course">${escHtml(course.name)}</div>` : ''}
        <div class="assignment-meta">
          ${dueBadge(a.dueDate)}
          <span class="badge badge-gray">${icon('award',12)} ${a.points} pts</span>
          <span class="badge badge-${subs.length > 0 ? 'green' : 'gray'}">${icon('inbox',12)} ${subs.length}/${enrolled}</span>
          ${ungraded > 0 ? `<span class="badge badge-amber">${icon('alert',12)} ${ungraded} sin calificar</span>` : ''}
        </div>
      </div>
      <div class="assignment-actions">
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Nav.go('teacher-assignment-detail', {id:'${a.id}'})">
          ${icon('eye',13)} Ver
        </button>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openAssignmentModal('${a.id}')">
          ${icon('edit',13)}
        </button>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteAssignment('${a.id}', '${courseId || ''}')">
          ${icon('trash',13)}
        </button>
      </div>
    </div>`;
}

function asgnCardStudent(a, course, sub, userId, showActions = false) {
  const cardClass = sub
    ? sub.grade !== null ? 'graded' : 'submitted'
    : isOverdue(a.dueDate) ? 'overdue' : '';

  const statusBadge = sub
    ? sub.grade !== null
      ? `<span class="badge badge-green">${icon('award',12)} ${sub.grade}/${a.points}</span>`
      : `<span class="badge badge-blue">${icon('send',12)} Entregada</span>`
    : isOverdue(a.dueDate)
      ? `<span class="badge badge-red">${icon('alert',12)} Vencida</span>`
      : `<span class="badge badge-amber">${icon('clock',12)} Pendiente</span>`;

  return `
    <div class="assignment-card ${cardClass}" style="cursor:pointer" onclick="Nav.go('student-assignment-detail', {id:'${a.id}'})">
      <div class="assignment-icon">${icon('clipboard', 18)}</div>
      <div class="assignment-body">
        <div class="assignment-title">${escHtml(a.title)}</div>
        ${course ? `<div class="assignment-course">${escHtml(course.name)}</div>` : ''}
        <div class="assignment-meta">
          ${dueBadge(a.dueDate)}
          <span class="badge badge-gray">${icon('award',12)} ${a.points} pts</span>
          ${statusBadge}
        </div>
      </div>
      ${showActions ? `
      <div class="assignment-actions">
        <button class="btn btn-sm ${sub ? 'btn-outline' : 'btn-primary'}"
                onclick="event.stopPropagation(); Nav.go('student-assignment-detail',{id:'${a.id}'})">
          ${sub ? icon('eye',13)+' Ver' : icon('send',13)+' Entregar'}
        </button>
      </div>` : ''}
    </div>`;
}

/* ── Empty state helpers ── */
function emptyStateInner(iconName, title, text, actions = '') {
  return `
    <div class="empty-state-icon">${icon(iconName, 28)}</div>
    <div class="empty-state-title">${title}</div>
    <div class="empty-state-text">${text}</div>
    ${actions}`;
}

function emptyState(iconName, title, text, actions = '') {
  return `<div class="empty-state">${emptyStateInner(iconName, title, text, actions)}</div>`;
}

/* ============================================================
   MODAL ACTIONS
   ============================================================ */

/* ── Course Modal ── */
let _editCourseId = null;
function openCourseModal(courseId = null) {
  _editCourseId = courseId;
  const title = $('#modal-course-title');
  const form  = $('#modal-course-form');
  if (!form) return;
  if (courseId) {
    const c = DB.courses.byId(courseId);
    if (!c) return;
    if (title) title.textContent = 'Editar Curso';
    form.querySelector('[name="name"]').value        = c.name;
    form.querySelector('[name="description"]').value = c.description || '';
  } else {
    if (title) title.textContent = 'Nuevo Curso';
    form.reset();
  }
  Modal.open('course');
}

function saveCourse(e) {
  e.preventDefault();
  const form = $('#modal-course-form');
  const name = form.querySelector('[name="name"]').value.trim();
  const desc = form.querySelector('[name="description"]').value.trim();
  if (!name) { toast('El nombre del curso es requerido', 'error'); return; }
  const user = Session.get();
  if (_editCourseId) {
    const c = DB.courses.byId(_editCourseId);
    c.name = name; c.description = desc;
    DB.courses.save(c);
    toast('Curso actualizado', 'success');
    Modal.close();
    Nav.go('teacher-course-detail', { id: _editCourseId });
  } else {
    DB.courses.create({ name, description: desc, teacherId: user.id });
    toast('Curso creado', 'success');
    Modal.close();
    Nav.go('teacher-courses');
  }
}

/* ── Assignment Modal ── */
let _editAsgnId = null;
let _defaultCourseId = null;
function openAssignmentModal(asgnId = null, courseId = null) {
  _editAsgnId      = asgnId;
  _defaultCourseId = courseId;
  const title  = $('#modal-asgn-title');
  const form   = $('#modal-asgn-form');
  const select = form?.querySelector('[name="courseId"]');
  if (!form || !select) return;

  const user      = Session.get();
  const myCourses = DB.courses.byTeacher(user.id);
  select.innerHTML = myCourses.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');

  if (asgnId) {
    const a = DB.assignments.byId(asgnId);
    if (!a) return;
    if (title) title.textContent = 'Editar Tarea';
    form.querySelector('[name="title"]').value       = a.title;
    form.querySelector('[name="description"]').value = a.description || '';
    form.querySelector('[name="dueDate"]').value     = a.dueDate;
    form.querySelector('[name="points"]').value      = a.points;
    select.value = a.courseId;
  } else {
    if (title) title.textContent = 'Nueva Tarea';
    form.reset();
    if (courseId && select) select.value = courseId;
  }
  Modal.open('assignment');
}

function saveAssignment(e) {
  e.preventDefault();
  const form     = $('#modal-asgn-form');
  const title    = form.querySelector('[name="title"]').value.trim();
  const desc     = form.querySelector('[name="description"]').value.trim();
  const dueDate  = form.querySelector('[name="dueDate"]').value;
  const points   = parseInt(form.querySelector('[name="points"]').value, 10);
  const courseId = form.querySelector('[name="courseId"]').value;

  if (!title)   { toast('El título es requerido', 'error'); return; }
  if (!dueDate) { toast('La fecha límite es requerida', 'error'); return; }
  if (!courseId){ toast('Selecciona un curso', 'error'); return; }
  if (isNaN(points) || points < 1) { toast('Los puntos deben ser un número positivo', 'error'); return; }

  const user = Session.get();
  if (_editAsgnId) {
    const a = DB.assignments.byId(_editAsgnId);
    a.title = title; a.description = desc; a.dueDate = dueDate; a.points = points; a.courseId = courseId;
    DB.assignments.save(a);
    toast('Tarea actualizada', 'success');
    Modal.close();
    Nav.go('teacher-assignment-detail', { id: _editAsgnId });
  } else {
    DB.assignments.create({ title, description: desc, dueDate, points, courseId, teacherId: user.id });
    toast('Tarea creada', 'success');
    Modal.close();
    Nav.go('teacher-course-detail', { id: courseId });
  }
}

/* ── Delete helpers ── */
function deleteCourse(id) {
  if (!confirm('¿Eliminar este curso? También se eliminarán sus tareas y entregas.')) return;
  DB.assignments.byCourse(id).forEach(a => {
    DB.submissions.byAssignment(a.id).forEach(s => DB.submissions.delete(s.id));
    DB.assignments.delete(a.id);
  });
  DB.courses.delete(id);
  toast('Curso eliminado', 'success');
  Nav.go('teacher-courses');
}

function deleteAssignment(id, returnCourseId = null) {
  if (!confirm('¿Eliminar esta tarea? También se eliminarán las entregas.')) return;
  const a   = DB.assignments.byId(id);
  const cid = a?.courseId || returnCourseId || null;
  DB.submissions.byAssignment(id).forEach(s => DB.submissions.delete(s.id));
  DB.assignments.delete(id);
  toast('Tarea eliminada', 'success');
  if (cid) Nav.go('teacher-course-detail', { id: cid });
  else Nav.go('teacher-assignments');
}

function removeStudent(courseId, studentId) {
  if (!confirm('¿Eliminar a este estudiante del curso?')) return;
  DB.courses.unenroll(courseId, studentId);
  toast('Estudiante eliminado del curso', 'success');
  Nav.go('teacher-course-detail', { id: courseId });
}

/* ── Grade Modal ── */
let _gradeSubId = null;
let _gradeMaxPoints = 100;
function openGradeModal(subId, maxPoints) {
  _gradeSubId     = subId;
  _gradeMaxPoints = maxPoints;
  const sub = DB.submissions.byId(subId);
  if (!sub) return;
  const form = $('#modal-grade-form');
  if (form) {
    form.querySelector('[name="grade"]').value    = sub.grade ?? '';
    form.querySelector('[name="feedback"]').value = sub.feedback ?? '';
    const maxEl = $('#grade-max');
    if (maxEl) maxEl.textContent = maxPoints;
  }
  Modal.open('grade');
}

function saveGrade(e) {
  e.preventDefault();
  const form     = $('#modal-grade-form');
  const grade    = parseInt(form.querySelector('[name="grade"]').value, 10);
  const feedback = form.querySelector('[name="feedback"]').value.trim();
  if (isNaN(grade) || grade < 0) { toast('Ingresa una calificación válida', 'error'); return; }
  if (grade > _gradeMaxPoints)   { toast(`La calificación no puede superar ${_gradeMaxPoints}`, 'error'); return; }
  DB.submissions.grade(_gradeSubId, { grade, feedback });
  toast('Calificación guardada', 'success');
  Modal.close();
  const sub = DB.submissions.byId(_gradeSubId);
  if (sub) Nav.go('teacher-assignment-detail', { id: sub.assignmentId });
}

/* ── Submit Modal ── */
let _submitAsgnId = null;
function openSubmitModal(asgnId, resubmit = false) {
  _submitAsgnId = asgnId;
  const title = $('#modal-submit-title');
  const form  = $('#modal-submit-form');
  if (!form) return;
  if (title) title.textContent = resubmit ? 'Re-entregar Tarea' : 'Entregar Tarea';
  const user     = Session.get();
  const existing = DB.submissions.get(asgnId, user.id);
  form.querySelector('[name="content"]').value = existing?.content || '';

  // Reset file UI
  const fileInput    = $('#submit-file-input');
  const fileInfo     = $('#file-selected-info');
  const fileName     = $('#file-selected-name');
  const fileDropText = $('#file-drop-text');
  if (fileInput) fileInput.value = '';
  // If resubmitting and previous file exists, show it
  if (existing?.fileName) {
    if (fileDropText) fileDropText.textContent = 'Haz clic para reemplazar el archivo';
    if (fileName) fileName.textContent = `${existing.fileName}${existing.fileSize ? ' (' + formatFileSize(existing.fileSize) + ')' : ''}`;
    if (fileInfo) fileInfo.hidden = false;
  } else {
    if (fileDropText) fileDropText.textContent = 'Haz clic para seleccionar un archivo';
    if (fileInfo) fileInfo.hidden = true;
  }
  Modal.open('submit');
}

function saveSubmit(e) {
  e.preventDefault();
  const form    = $('#modal-submit-form');
  const content = form.querySelector('[name="content"]').value.trim();
  if (!content) { toast('El contenido de la entrega es requerido', 'error'); return; }

  const user      = Session.get();
  const fileInput = $('#submit-file-input');
  const file      = fileInput?.files?.[0];

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file && file.size > MAX_SIZE) {
    toast('El archivo supera el límite de 5 MB', 'error');
    return;
  }

  function persist(fileName, fileData, fileSize) {
    DB.submissions.submit({ assignmentId: _submitAsgnId, studentId: user.id, content, fileName, fileData, fileSize });
    toast('Tarea entregada exitosamente', 'success');
    Modal.close();
    Nav.go('student-assignment-detail', { id: _submitAsgnId });
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = ev => persist(file.name, ev.target.result, file.size);
    reader.onerror = () => { toast('Error al leer el archivo', 'error'); };
    reader.readAsDataURL(file);
  } else {
    // No new file selected — keep existing attachment if any
    const existing = DB.submissions.get(_submitAsgnId, user.id);
    persist(existing?.fileName || null, existing?.fileData || null, existing?.fileSize || null);
  }
}

/* ── Join Course Modal ── */
function openJoinModal() {
  const form = $('#modal-join-form');
  if (form) form.reset();
  Modal.open('join');
}

function saveJoin(e) {
  e.preventDefault();
  const form   = $('#modal-join-form');
  const code   = form.querySelector('[name="code"]').value.trim().toUpperCase();
  if (!code) { toast('Ingresa un código', 'error'); return; }
  const course = DB.courses.byCode(code);
  if (!course) { toast('Código inválido. Verifica con tu profesor.', 'error'); return; }
  const user = Session.get();
  const ok   = DB.courses.enroll(course.id, user.id);
  if (!ok) { toast('Ya estás inscrito en este curso', 'info'); Modal.close(); return; }
  toast(`¡Te uniste a "${course.name}"!`, 'success');
  Modal.close();
  Nav.go('student-courses');
}

/* ── Copy code ── */
function copyCode(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
      .then(() => toast('Código copiado al portapapeles', 'success'))
      .catch(() => toast('Código: ' + code, 'info'));
  } else {
    toast('Código: ' + code, 'info');
  }
}

/* ============================================================
   AUTH
   ============================================================ */

function showAuthView(view) {
  $$('.auth-view').forEach(v => hide(v));
  const el = $(`#auth-${view}`);
  if (el) show(el);
}

function handleLogin(e) {
  e.preventDefault();
  const form  = $('#login-form');
  const email = form.querySelector('[name="email"]').value.trim();
  const pass  = form.querySelector('[name="password"]').value;
  const user  = DB.users.byEmail(email);
  if (!user || !DB.users.verifyPassword(user, pass)) {
    toast('Correo o contraseña incorrectos', 'error');
    return;
  }
  Session.set(user);
  startApp(user);
}

function handleRegister(e) {
  e.preventDefault();
  const form  = $('#register-form');
  const name  = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const pass  = form.querySelector('[name="password"]').value;
  const role  = form.querySelector('[name="role"]').value;

  if (!name)  { toast('El nombre es requerido', 'error'); return; }
  if (!email) { toast('El correo es requerido', 'error'); return; }
  if (!pass || pass.length < 8) { toast('La contraseña debe tener al menos 8 caracteres', 'error'); return; }

  const user = DB.users.create({ name, email, password: pass, role });
  if (!user) { toast('Ya existe una cuenta con ese correo', 'error'); return; }
  Session.set(user);
  toast(`¡Bienvenido, ${name}!`, 'success');
  startApp(user);
}

function handleLogout() {
  Session.clear();
  location.reload();
}

function selectRole(role) {
  $$('.role-option').forEach(o => o.classList.toggle('active', o.dataset.role === role));
  const input = $('#register-form [name="role"]');
  if (input) input.value = role;
}

/* ============================================================
   APP INIT
   ============================================================ */

function startApp(user) {
  hide($('#auth-section'));
  show($('#app-section'));
  buildSidebar(user);

  $('#btn-logout')?.addEventListener('click', handleLogout);

  const ham      = $('#hamburger');
  const sidebar  = $('#sidebar');
  const backdrop = $('#sidebar-backdrop');

  ham?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('show');
  });

  backdrop?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    backdrop.classList.remove('show');
  });

  $('#modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) Modal.close();
  });

  $$('.modal-close').forEach(btn => btn.addEventListener('click', Modal.close));

  // File input handler for submit modal
  $('#submit-file-input')?.addEventListener('change', function() {
    const file = this.files?.[0];
    const fileInfo     = $('#file-selected-info');
    const fileNameEl   = $('#file-selected-name');
    const fileDropText = $('#file-drop-text');
    if (file) {
      if (fileNameEl) fileNameEl.textContent = `${file.name} (${formatFileSize(file.size)})`;
      if (fileInfo)   fileInfo.hidden = false;
      if (fileDropText) fileDropText.textContent = 'Haz clic para reemplazar el archivo';
    }
  });

  $('#file-remove-btn')?.addEventListener('click', function() {
    const fileInput    = $('#submit-file-input');
    const fileInfo     = $('#file-selected-info');
    const fileDropText = $('#file-drop-text');
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.hidden = true;
    if (fileDropText) fileDropText.textContent = 'Haz clic para seleccionar un archivo';
    // Clear existing attachment from pending resubmit
    if (_submitAsgnId) {
      const existing = DB.submissions.get(_submitAsgnId, Session.get()?.id);
      if (existing) { existing.fileName = null; existing.fileData = null; existing.fileSize = null; DB.submissions.save(existing); }
    }
  });

  // Hash routing: restore view from URL hash
  const hash = location.hash.replace('#', '');
  const validViews = user.role === 'teacher'
    ? ['teacher-overview','teacher-courses','teacher-assignments','teacher-submissions']
    : ['student-overview','student-courses','student-assignments','student-my-submissions'];

  if (hash && validViews.includes(hash)) {
    Nav.go(hash);
  } else {
    Nav.go(user.role === 'teacher' ? 'teacher-overview' : 'student-overview');
  }
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  DB.init();

  $('#login-form')?.addEventListener('submit', handleLogin);
  $('#register-form')?.addEventListener('submit', handleRegister);

  const user = Session.get();
  if (user) {
    startApp(user);
  } else {
    show($('#auth-section'));
    hide($('#app-section'));
  }
});
