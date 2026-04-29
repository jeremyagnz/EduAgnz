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

function toast(msg, type = 'info') {
  const container = $('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icons[type] || 'ℹ️';
  const msgSpan = document.createElement('span');
  msgSpan.textContent = msg;
  t.appendChild(iconSpan);
  t.appendChild(msgSpan);
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  if (d < 0)  return `<span class="badge badge-red">⏰ Vencida</span>`;
  if (d === 0) return `<span class="badge badge-amber">⚡ Vence hoy</span>`;
  if (d <= 3) return `<span class="badge badge-amber">⏳ ${d}d</span>`;
  return `<span class="badge badge-blue">📅 ${formatDate(dateStr)}</span>`;
}

function initials(name) {
  return name.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Modal ── */
const Modal = {
  currentId: null,
  open(id) {
    Modal.close(); // close any existing first
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
    // Hide all views
    $$('.view').forEach(v => v.classList.remove('active'));
    // Show target
    const view = $(`#view-${viewId}`);
    if (!view) return;
    view.classList.add('active');
    Nav.currentView = viewId;

    // Update sidebar nav highlights
    $$('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewId);
    });

    // Render view
    const renderer = ViewRenderers[viewId];
    if (renderer) renderer(data);

    // Scroll main content to top
    const mc = $('#main-content');
    if (mc) mc.scrollTop = 0;
  },
};

/* ── Topbar ── */
function setTopbar(title, subtitle = '') {
  const el = $('#topbar-title');
  const sub = $('#topbar-subtitle');
  if (el)  el.textContent = title;
  if (sub) {
    sub.textContent = subtitle;
    sub.style.display = subtitle ? '' : 'none';
  }
}

/* ── Sidebar ── */
function buildSidebar(user) {
  const sidebarUser = $('#sidebar-user-name');
  const sidebarRole = $('#sidebar-user-role');
  const sidebarAvatar = $('#sidebar-avatar');
  if (sidebarUser)   sidebarUser.textContent = user.name;
  if (sidebarRole)   sidebarRole.textContent = user.role === 'teacher' ? 'Profesor' : 'Estudiante';
  if (sidebarAvatar) sidebarAvatar.textContent = initials(user.name);

  const nav = $('#sidebar-nav');
  if (!nav) return;

  if (user.role === 'teacher') {
    nav.innerHTML = `
      <div class="sidebar-section-title">Principal</div>
      <button class="nav-item" data-view="teacher-overview">
        <span class="nav-icon">🏠</span> Inicio
      </button>
      <div class="sidebar-section-title">Gestión</div>
      <button class="nav-item" data-view="teacher-courses">
        <span class="nav-icon">📚</span> Mis Cursos
      </button>
      <button class="nav-item" data-view="teacher-assignments">
        <span class="nav-icon">📋</span> Tareas
      </button>
      <button class="nav-item" data-view="teacher-submissions">
        <span class="nav-icon">📥</span> Entregas
      </button>
    `;
  } else {
    nav.innerHTML = `
      <div class="sidebar-section-title">Principal</div>
      <button class="nav-item" data-view="student-overview">
        <span class="nav-icon">🏠</span> Inicio
      </button>
      <div class="sidebar-section-title">Académico</div>
      <button class="nav-item" data-view="student-courses">
        <span class="nav-icon">📚</span> Mis Cursos
      </button>
      <button class="nav-item" data-view="student-assignments">
        <span class="nav-icon">📋</span> Tareas
      </button>
      <button class="nav-item" data-view="student-my-submissions">
        <span class="nav-icon">📤</span> Mis Entregas
      </button>
    `;
  }

  // Wire nav clicks
  $$('.nav-item', nav).forEach(btn => {
    btn.addEventListener('click', () => {
      Nav.go(btn.dataset.view);
      // Close mobile sidebar
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
  const user   = Session.get();
  const myCourses = DB.courses.byTeacher(user.id);
  const myAsgns   = DB.assignments.byTeacher(user.id);
  const allSubs   = DB.submissions.all().filter(s => myAsgns.some(a => a.id === s.assignmentId));
  const ungraded  = allSubs.filter(s => s.grade === null);

  setTopbar('Inicio', `Bienvenida, ${user.name.split(' ')[0]}`);

  $('#teacher-stat-courses').textContent  = myCourses.length;
  $('#teacher-stat-asgns').textContent    = myAsgns.length;
  $('#teacher-stat-subs').textContent     = allSubs.length;
  $('#teacher-stat-ungraded').textContent = ungraded.length;

  // Recent assignments
  const recent = [...myAsgns].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const container = $('#teacher-recent-asgns');
  if (!container) return;
  if (!recent.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><p class="empty-state-text">Aún no has creado tareas.</p></div>`;
    return;
  }
  container.innerHTML = recent.map(a => {
    const course = DB.courses.byId(a.courseId);
    const subs   = DB.submissions.byAssignment(a.id);
    const enrolled = (course?.studentIds || []).length;
    return `
      <div class="assignment-card" style="cursor:pointer" onclick="Nav.go('teacher-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-course">${escHtml(course?.name || '')}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            <span class="badge badge-${subs.length > 0 ? 'green' : 'gray'}">📥 ${subs.length}/${enrolled} entregas</span>
          </div>
        </div>
        <div class="assignment-actions">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Nav.go('teacher-assignment-detail', {id:'${a.id}'})">Ver</button>
        </div>
      </div>`;
  }).join('');
};

/* ── TEACHER COURSES ── */
ViewRenderers['teacher-courses'] = function() {
  const user = Session.get();
  setTopbar('Mis Cursos', 'Gestiona tus cursos');
  const myCourses = DB.courses.byTeacher(user.id);
  const grid = $('#teacher-courses-grid');
  if (!grid) return;

  if (!myCourses.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-title">Aún no tienes cursos</div>
        <div class="empty-state-text">Crea tu primer curso para empezar a gestionar tareas.</div>
        <button class="btn btn-primary" onclick="openCourseModal()">+ Nuevo Curso</button>
      </div>`;
    return;
  }

  grid.innerHTML = myCourses.map(c => {
    const asgns   = DB.assignments.byCourse(c.id);
    const enrolled = (c.studentIds || []).length;
    return `
      <div class="card" style="cursor:pointer" onclick="Nav.go('teacher-course-detail', {id:'${c.id}'})">
        <div class="card-color-bar ${c.color || 'color-blue'}"></div>
        <div class="card-header">
          <div class="card-title">${escHtml(c.name)}</div>
          <span class="card-code">${escHtml(c.code)}</span>
          <div class="card-description">${escHtml(c.description || '')}</div>
        </div>
        <div class="card-footer">
          <span class="badge badge-blue">👨‍🎓 ${enrolled} alumnos</span>
          <span class="badge badge-gray">📋 ${asgns.length} tareas</span>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openCourseModal('${c.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteCourse('${c.id}')">🗑️</button>
        </div>
      </div>`;
  }).join('');
};

/* ── TEACHER COURSE DETAIL ── */
ViewRenderers['teacher-course-detail'] = function({ id }) {
  const course = DB.courses.byId(id);
  if (!course) { Nav.go('teacher-courses'); return; }
  setTopbar(course.name, 'Detalle del curso');

  // Breadcrumb
  const bc = $('#teacher-course-detail-breadcrumb');
  if (bc) bc.innerHTML = `
    <span class="breadcrumb-item" onclick="Nav.go('teacher-courses')">Mis Cursos</span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-item current">${escHtml(course.name)}</span>`;

  // Header
  const header = $('#teacher-course-detail-header');
  if (header) {
    const teacher = DB.users.byId(course.teacherId);
    header.innerHTML = `
      <div class="course-header-card">
        <div class="course-header-banner ${course.color || 'color-blue'}"></div>
        <div class="course-header-body">
          <div class="course-header-info">
            <div class="course-header-title">${escHtml(course.name)}</div>
            <div class="course-header-desc">${escHtml(course.description || 'Sin descripción')}</div>
            <div class="course-header-meta">
              <span class="badge badge-blue">📋 Código: <strong>${escHtml(course.code)}</strong></span>
              <span class="badge badge-gray">👨‍🎓 ${(course.studentIds||[]).length} estudiantes</span>
              <span class="badge badge-gray">📅 Creado ${formatDate(course.createdAt?.slice(0,10))}</span>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;flex-shrink:0">
            <button class="btn btn-secondary btn-sm" onclick="openCourseModal('${course.id}')">✏️ Editar</button>
          </div>
        </div>
      </div>`;
  }

  // Enroll code
  const codeEl = $('#teacher-enroll-code');
  if (codeEl) codeEl.innerHTML = `
    <div class="enroll-code-display">
      <span class="enroll-code-text">${escHtml(course.code)}</span>
      <button class="btn btn-sm btn-secondary" onclick="copyCode('${escHtml(course.code)}')">📋 Copiar</button>
    </div>
    <small style="color:var(--text-muted);font-size:.78rem;margin-top:.4rem;display:block">Comparte este código con tus estudiantes para que se unan al curso.</small>`;

  // Assignments
  renderTeacherCourseAssignments(id);

  // Students
  renderCourseStudents(id);
};

function renderTeacherCourseAssignments(courseId) {
  const container = $('#teacher-course-assignments-list');
  if (!container) return;
  const asgns = DB.assignments.byCourse(courseId);
  if (!asgns.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">Sin tareas</div>
        <div class="empty-state-text">Crea la primera tarea para este curso.</div>
        <button class="btn btn-primary" onclick="openAssignmentModal(null, '${courseId}')">+ Nueva Tarea</button>
      </div>`;
    return;
  }
  const course = DB.courses.byId(courseId);
  const enrolled = (course?.studentIds || []).length;
  container.innerHTML = asgns.map(a => {
    const subs = DB.submissions.byAssignment(a.id);
    const ungraded = subs.filter(s => s.grade === null).length;
    return `
      <div class="assignment-card" style="cursor:pointer" onclick="Nav.go('teacher-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            <span class="badge badge-${subs.length > 0 ? 'green' : 'gray'}">📥 ${subs.length}/${enrolled}</span>
            ${ungraded > 0 ? `<span class="badge badge-amber">⏳ ${ungraded} sin calificar</span>` : ''}
          </div>
        </div>
        <div class="assignment-actions">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Nav.go('teacher-assignment-detail', {id:'${a.id}'})">Ver entregas</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openAssignmentModal('${a.id}')">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteAssignment('${a.id}', '${courseId}')">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function renderCourseStudents(courseId) {
  const container = $('#teacher-course-students-list');
  if (!container) return;
  const course = DB.courses.byId(courseId);
  const studentIds = course?.studentIds || [];
  if (!studentIds.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:.88rem;padding:1rem 0">Aún no hay estudiantes inscritos. Comparte el código del curso.</p>`;
    return;
  }
  container.innerHTML = `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Estudiante</th><th>Email</th><th>Tareas entregadas</th><th></th></tr></thead>
        <tbody>
          ${studentIds.map(sid => {
            const s = DB.users.byId(sid);
            if (!s) return '';
            const asgns = DB.assignments.byCourse(courseId);
            const subs = asgns.reduce((acc, a) => {
              const sub = DB.submissions.get(a.id, sid);
              return acc + (sub ? 1 : 0);
            }, 0);
            return `<tr>
              <td><strong>${escHtml(s.name)}</strong></td>
              <td style="color:var(--text-muted)">${escHtml(s.email)}</td>
              <td>${subs} / ${asgns.length}</td>
              <td><button class="btn btn-sm btn-danger" onclick="removeStudent('${courseId}','${sid}')">Eliminar</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── TEACHER ALL ASSIGNMENTS ── */
ViewRenderers['teacher-assignments'] = function() {
  const user  = Session.get();
  setTopbar('Tareas', 'Todas tus tareas');
  const asgns   = DB.assignments.byTeacher(user.id);
  const container = $('#teacher-assignments-list');
  if (!container) return;

  if (!asgns.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">Aún no has creado tareas</div>
        <div class="empty-state-text">Ve a un curso y crea tu primera tarea.</div>
        <button class="btn btn-primary" onclick="Nav.go('teacher-courses')">Ir a Mis Cursos</button>
      </div>`;
    return;
  }

  const sorted = [...asgns].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  container.innerHTML = sorted.map(a => {
    const course  = DB.courses.byId(a.courseId);
    const subs    = DB.submissions.byAssignment(a.id);
    const enrolled = (course?.studentIds || []).length;
    const ungraded = subs.filter(s => s.grade === null).length;
    return `
      <div class="assignment-card" style="cursor:pointer" onclick="Nav.go('teacher-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-course">${escHtml(course?.name || 'Curso eliminado')}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            <span class="badge badge-${subs.length > 0 ? 'green' : 'gray'}">📥 ${subs.length}/${enrolled}</span>
            ${ungraded > 0 ? `<span class="badge badge-amber">⏳ ${ungraded} sin calificar</span>` : ''}
          </div>
        </div>
        <div class="assignment-actions">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Nav.go('teacher-assignment-detail', {id:'${a.id}'})">Ver entregas</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openAssignmentModal('${a.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteAssignment('${a.id}')">🗑️</button>
        </div>
      </div>`;
  }).join('');
};

/* ── TEACHER ASSIGNMENT DETAIL (submissions) ── */
ViewRenderers['teacher-assignment-detail'] = function({ id }) {
  const asgn = DB.assignments.byId(id);
  if (!asgn) { Nav.go('teacher-assignments'); return; }
  const course = DB.courses.byId(asgn.courseId);
  setTopbar(asgn.title, 'Detalle de tarea');

  // Breadcrumb
  const bc = $('#teacher-asgn-breadcrumb');
  if (bc) bc.innerHTML = `
    <span class="breadcrumb-item" onclick="Nav.go('teacher-course-detail', {id:'${asgn.courseId}'})">
      ${escHtml(course?.name || 'Curso')}
    </span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-item current">${escHtml(asgn.title)}</span>`;

  // Info
  const info = $('#teacher-asgn-info');
  if (info) info.innerHTML = `
    <div class="detail-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.8rem">
        <div>
          <div class="detail-title">${escHtml(asgn.title)}</div>
          <span class="badge badge-blue">${escHtml(course?.name || '')}</span>
        </div>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn-sm btn-secondary" onclick="openAssignmentModal('${asgn.id}')">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteAssignment('${asgn.id}')">🗑️ Eliminar</button>
        </div>
      </div>
      <div class="detail-body" style="margin-top:.8rem">${escHtml(asgn.description || 'Sin descripción')}</div>
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
          <span class="detail-meta-label">Creada</span>
          <span class="detail-meta-value">${formatDate(asgn.createdAt?.slice(0,10))}</span>
        </div>
      </div>
    </div>`;

  // Submissions list
  const container = $('#teacher-asgn-submissions');
  if (!container) return;
  const subs    = DB.submissions.byAssignment(id);
  const enrolled = (course?.studentIds || []);

  if (!enrolled.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><div class="empty-state-text">No hay estudiantes inscritos en este curso.</div></div>`;
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
            <div>
              <div class="submission-student">👤 ${escHtml(student.name)}</div>
              <div class="submission-date">${escHtml(student.email)}</div>
            </div>
            <span class="badge badge-gray">⏳ Sin entregar</span>
          </div>
        </div>`;
    }
    const gradeHtml = sub.grade !== null
      ? `<div class="grade-display">🏆 ${sub.grade} / ${asgn.points} pts</div>`
      : `<span class="badge badge-amber">Sin calificar</span>`;
    return `
      <div class="submission-box">
        <div class="submission-header">
          <div>
            <div class="submission-student">👤 ${escHtml(student.name)}</div>
            <div class="submission-date">Enviado: ${formatDateTime(sub.submittedAt)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            ${gradeHtml}
            <button class="btn btn-sm btn-primary" onclick="openGradeModal('${sub.id}', ${asgn.points})">
              ${sub.grade !== null ? '✏️ Editar nota' : '📊 Calificar'}
            </button>
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${sub.fileName ? `<div class="file-attachment">📎 ${escHtml(sub.fileName)}</div>` : ''}
        ${sub.feedback ? `<div class="feedback-block"><div class="feedback-label">Retroalimentación del profesor</div>${escHtml(sub.feedback)}</div>` : ''}
      </div>`;
  }).join('');
};

/* ── TEACHER ALL SUBMISSIONS ── */
ViewRenderers['teacher-submissions'] = function() {
  const user = Session.get();
  setTopbar('Entregas', 'Todas las entregas recibidas');
  const myAsgns = DB.assignments.byTeacher(user.id);
  const allSubs = DB.submissions.all().filter(s => myAsgns.some(a => a.id === s.assignmentId));
  const container = $('#teacher-all-submissions');
  if (!container) return;

  if (!allSubs.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📥</div><div class="empty-state-title">Sin entregas</div><div class="empty-state-text">Tus estudiantes aún no han entregado tareas.</div></div>`;
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
            <th>Entregada</th>
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
              <td><strong>${escHtml(student?.name || '?')}</strong></td>
              <td>${escHtml(asgn?.title || '?')}</td>
              <td>${escHtml(course?.name || '?')}</td>
              <td style="color:var(--text-muted)">${formatDateTime(sub.submittedAt)}</td>
              <td>${sub.grade !== null
                ? `<span class="badge badge-green">✅ ${sub.grade}/${asgn?.points || '?'}</span>`
                : `<span class="badge badge-amber">⏳ Sin calificar</span>`}
              </td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="Nav.go('teacher-assignment-detail',{id:'${sub.assignmentId}'})">Ver</button>
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
  const user = Session.get();
  setTopbar('Inicio', `Bienvenido, ${user.name.split(' ')[0]}`);

  const myCourses = DB.courses.byStudent(user.id);
  const allAsgns  = myCourses.flatMap(c => DB.assignments.byCourse(c.id));
  const mySubs    = DB.submissions.byStudent(user.id);
  const pending   = allAsgns.filter(a => {
    const sub = DB.submissions.get(a.id, user.id);
    return !sub && !isOverdue(a.dueDate);
  });
  const graded = mySubs.filter(s => s.grade !== null);

  $('#student-stat-courses').textContent  = myCourses.length;
  $('#student-stat-pending').textContent  = pending.length;
  $('#student-stat-subs').textContent     = mySubs.length;
  $('#student-stat-graded').textContent   = graded.length;

  // Upcoming assignments
  const container = $('#student-upcoming-asgns');
  if (!container) return;
  const upcoming = allAsgns
    .filter(a => !isOverdue(a.dueDate))
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  if (!upcoming.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">¡No tienes tareas pendientes!</div></div>`;
    return;
  }

  container.innerHTML = upcoming.map(a => {
    const course = DB.courses.byId(a.courseId);
    const sub    = DB.submissions.get(a.id, user.id);
    const status = sub
      ? sub.grade !== null
        ? `<span class="badge badge-green">✅ ${sub.grade}/${a.points}</span>`
        : `<span class="badge badge-blue">📤 Entregada</span>`
      : `<span class="badge badge-amber">⏳ Pendiente</span>`;
    return `
      <div class="assignment-card ${sub ? 'submitted' : ''}" style="cursor:pointer" onclick="Nav.go('student-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-course">${escHtml(course?.name || '')}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            ${status}
          </div>
        </div>
      </div>`;
  }).join('');
};

/* ── STUDENT COURSES ── */
ViewRenderers['student-courses'] = function() {
  const user = Session.get();
  setTopbar('Mis Cursos', 'Cursos en los que estás inscrito');
  const myCourses = DB.courses.byStudent(user.id);
  const grid = $('#student-courses-grid');
  if (!grid) return;

  if (!myCourses.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-title">Aún no estás inscrito en ningún curso</div>
        <div class="empty-state-text">Usa el código de inscripción que te dio tu profesor.</div>
        <button class="btn btn-primary" onclick="openJoinModal()">🔑 Unirse a un Curso</button>
      </div>`;
    return;
  }

  grid.innerHTML = myCourses.map(c => {
    const asgns   = DB.assignments.byCourse(c.id);
    const teacher = DB.users.byId(c.teacherId);
    const pending = asgns.filter(a => {
      const sub = DB.submissions.get(a.id, user.id);
      return !sub && !isOverdue(a.dueDate);
    }).length;
    return `
      <div class="card" style="cursor:pointer" onclick="Nav.go('student-course-detail', {id:'${c.id}'})">
        <div class="card-color-bar ${c.color || 'color-blue'}"></div>
        <div class="card-header">
          <div class="card-title">${escHtml(c.name)}</div>
          <div class="card-description">${escHtml(c.description || '')}</div>
          <div style="margin-top:.5rem;font-size:.8rem;color:var(--text-muted)">👩‍🏫 ${escHtml(teacher?.name || '')}</div>
        </div>
        <div class="card-footer">
          <span class="badge badge-gray">📋 ${asgns.length} tareas</span>
          ${pending > 0 ? `<span class="badge badge-amber">⏳ ${pending} pendientes</span>` : '<span class="badge badge-green">✅ Al día</span>'}
        </div>
      </div>`;
  }).join('');
};

/* ── STUDENT COURSE DETAIL ── */
ViewRenderers['student-course-detail'] = function({ id }) {
  const user   = Session.get();
  const course = DB.courses.byId(id);
  if (!course) { Nav.go('student-courses'); return; }
  setTopbar(course.name, 'Detalle del curso');

  const bc = $('#student-course-breadcrumb');
  if (bc) bc.innerHTML = `
    <span class="breadcrumb-item" onclick="Nav.go('student-courses')">Mis Cursos</span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-item current">${escHtml(course.name)}</span>`;

  const header = $('#student-course-header');
  if (header) {
    const teacher = DB.users.byId(course.teacherId);
    header.innerHTML = `
      <div class="course-header-card">
        <div class="course-header-banner ${course.color || 'color-blue'}"></div>
        <div class="course-header-body">
          <div class="course-header-info">
            <div class="course-header-title">${escHtml(course.name)}</div>
            <div class="course-header-desc">${escHtml(course.description || '')}</div>
            <div class="course-header-meta">
              <span class="badge badge-blue">👩‍🏫 ${escHtml(teacher?.name || '')}</span>
              <span class="badge badge-gray">👨‍🎓 ${(course.studentIds||[]).length} estudiantes</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  const container = $('#student-course-asgns');
  if (!container) return;
  const asgns = DB.assignments.byCourse(id);
  if (!asgns.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">El profesor aún no ha publicado tareas.</div></div>`;
    return;
  }
  container.innerHTML = asgns.map(a => {
    const sub = DB.submissions.get(a.id, user.id);
    const cardClass = sub
      ? sub.grade !== null ? 'graded' : 'submitted'
      : isOverdue(a.dueDate) ? 'overdue' : '';
    const status = sub
      ? sub.grade !== null
        ? `<span class="badge badge-green">✅ ${sub.grade}/${a.points} pts</span>`
        : `<span class="badge badge-blue">📤 Entregada</span>`
      : isOverdue(a.dueDate)
        ? `<span class="badge badge-red">❌ Vencida</span>`
        : `<span class="badge badge-amber">⏳ Pendiente</span>`;
    return `
      <div class="assignment-card ${cardClass}" style="cursor:pointer" onclick="Nav.go('student-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            ${status}
          </div>
        </div>
        <div class="assignment-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); Nav.go('student-assignment-detail',{id:'${a.id}'})">
            ${sub ? 'Ver entrega' : 'Entregar'}
          </button>
        </div>
      </div>`;
  }).join('');
};

/* ── STUDENT ALL ASSIGNMENTS ── */
ViewRenderers['student-assignments'] = function() {
  const user = Session.get();
  setTopbar('Tareas', 'Todas tus tareas');
  const myCourses = DB.courses.byStudent(user.id);
  const allAsgns  = myCourses.flatMap(c => DB.assignments.byCourse(c.id));
  const container = $('#student-assignments-list');
  if (!container) return;

  if (!allAsgns.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Inscríbete en un curso para ver las tareas.</div></div>`;
    return;
  }

  const sorted = [...allAsgns].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  container.innerHTML = sorted.map(a => {
    const course = DB.courses.byId(a.courseId);
    const sub    = DB.submissions.get(a.id, user.id);
    const cardClass = sub
      ? sub.grade !== null ? 'graded' : 'submitted'
      : isOverdue(a.dueDate) ? 'overdue' : '';
    const status = sub
      ? sub.grade !== null
        ? `<span class="badge badge-green">✅ Calificada: ${sub.grade}/${a.points}</span>`
        : `<span class="badge badge-blue">📤 Entregada</span>`
      : isOverdue(a.dueDate)
        ? `<span class="badge badge-red">❌ Vencida</span>`
        : `<span class="badge badge-amber">⏳ Pendiente</span>`;
    return `
      <div class="assignment-card ${cardClass}" style="cursor:pointer" onclick="Nav.go('student-assignment-detail', {id:'${a.id}'})">
        <div class="assignment-icon">📝</div>
        <div class="assignment-body">
          <div class="assignment-title">${escHtml(a.title)}</div>
          <div class="assignment-course">${escHtml(course?.name || '')}</div>
          <div class="assignment-meta">
            ${dueBadge(a.dueDate)}
            <span class="badge badge-gray">🏆 ${a.points} pts</span>
            ${status}
          </div>
        </div>
        <div class="assignment-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); Nav.go('student-assignment-detail',{id:'${a.id}'})">
            ${sub ? 'Ver' : 'Entregar'}
          </button>
        </div>
      </div>`;
  }).join('');
};

/* ── STUDENT ASSIGNMENT DETAIL ── */
ViewRenderers['student-assignment-detail'] = function({ id }) {
  const user = Session.get();
  const asgn = DB.assignments.byId(id);
  if (!asgn) { Nav.go('student-assignments'); return; }
  const course = DB.courses.byId(asgn.courseId);
  const sub    = DB.submissions.get(id, user.id);
  setTopbar(asgn.title, 'Detalle de tarea');

  const bc = $('#student-asgn-breadcrumb');
  if (bc) bc.innerHTML = `
    <span class="breadcrumb-item" onclick="Nav.go('student-course-detail', {id:'${asgn.courseId}'})">
      ${escHtml(course?.name || 'Curso')}
    </span>
    <span class="breadcrumb-sep">›</span>
    <span class="breadcrumb-item current">${escHtml(asgn.title)}</span>`;

  const info = $('#student-asgn-info');
  if (info) {
    const overdueAlert = isOverdue(asgn.dueDate) && !sub
      ? `<div class="alert alert-danger" style="margin-top:1rem">⏰ Esta tarea ya venció. Ya no puedes entregarla.</div>` : '';
    info.innerHTML = `
      <div class="detail-card">
        <div class="detail-title">${escHtml(asgn.title)}</div>
        <span class="badge badge-blue">${escHtml(course?.name || '')}</span>
        <div class="detail-body" style="margin-top:.8rem">${escHtml(asgn.description || 'Sin descripción')}</div>
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
            <span class="detail-meta-value">${
              sub
                ? sub.grade !== null ? `✅ Calificada: ${sub.grade}/${asgn.points}` : '📤 Entregada'
                : isOverdue(asgn.dueDate) ? '❌ Vencida' : '⏳ Pendiente'
            }</span>
          </div>
        </div>
        ${overdueAlert}
      </div>`;
  }

  // Submission section
  const subSection = $('#student-submission-section');
  if (!subSection) return;

  if (sub) {
    // Show existing submission
    const gradeHtml = sub.grade !== null
      ? `<div class="alert alert-success" style="margin-top:1rem">
           <strong>🏆 Calificación: ${sub.grade} / ${asgn.points} puntos</strong>
           ${sub.feedback ? `<div class="feedback-block" style="margin-top:.5rem"><div class="feedback-label">Retroalimentación</div>${escHtml(sub.feedback)}</div>` : ''}
         </div>`
      : `<div class="alert alert-info" style="margin-top:1rem">ℹ️ Tu entrega está siendo revisada por el profesor.</div>`;

    subSection.innerHTML = `
      <div class="detail-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
          <div class="detail-title" style="font-size:1rem">📤 Mi Entrega</div>
          <div style="display:flex;gap:.4rem;align-items:center">
            <span style="font-size:.8rem;color:var(--text-muted)">${formatDateTime(sub.submittedAt)}</span>
            ${!isOverdue(asgn.dueDate) || sub.grade === null
              ? `<button class="btn btn-sm btn-outline" onclick="openSubmitModal('${id}', true)">✏️ Re-entregar</button>` : ''}
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${sub.fileName ? `<div class="file-attachment">📎 ${escHtml(sub.fileName)}</div>` : ''}
        ${gradeHtml}
      </div>`;
  } else if (!isOverdue(asgn.dueDate)) {
    subSection.innerHTML = `
      <div class="detail-card">
        <div class="detail-title" style="font-size:1rem;margin-bottom:1rem">📝 Entregar Tarea</div>
        <button class="btn btn-primary btn-lg" onclick="openSubmitModal('${id}')">📤 Subir Entrega</button>
      </div>`;
  } else {
    subSection.innerHTML = `
      <div class="detail-card">
        <div class="alert alert-danger">⏰ Esta tarea venció sin entrega. No puedes entregarla.</div>
      </div>`;
  }
};

/* ── STUDENT MY SUBMISSIONS ── */
ViewRenderers['student-my-submissions'] = function() {
  const user  = Session.get();
  setTopbar('Mis Entregas', 'Historial de entregas y calificaciones');
  const subs  = DB.submissions.byStudent(user.id);
  const container = $('#student-my-subs-list');
  if (!container) return;

  if (!subs.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📤</div><div class="empty-state-title">Sin entregas</div><div class="empty-state-text">Aún no has entregado ninguna tarea.</div></div>`;
    return;
  }

  const sorted = [...subs].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  container.innerHTML = sorted.map(sub => {
    const asgn   = DB.assignments.byId(sub.assignmentId);
    const course = asgn ? DB.courses.byId(asgn.courseId) : null;
    const gradeHtml = sub.grade !== null
      ? `<span class="badge badge-green">🏆 ${sub.grade} / ${asgn?.points || '?'} pts</span>`
      : `<span class="badge badge-amber">⏳ Pendiente</span>`;
    return `
      <div class="submission-box">
        <div class="submission-header">
          <div>
            <div class="submission-student">📝 ${escHtml(asgn?.title || 'Tarea eliminada')}</div>
            <div class="submission-date">
              ${escHtml(course?.name || '')} · Enviada: ${formatDateTime(sub.submittedAt)}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            ${gradeHtml}
            ${asgn ? `<button class="btn btn-sm btn-outline" onclick="Nav.go('student-assignment-detail',{id:'${asgn.id}'})">Ver</button>` : ''}
          </div>
        </div>
        <div class="submission-content">${escHtml(sub.content)}</div>
        ${sub.fileName ? `<div class="file-attachment">📎 ${escHtml(sub.fileName)}</div>` : ''}
        ${sub.feedback ? `<div class="feedback-block"><div class="feedback-label">Retroalimentación</div>${escHtml(sub.feedback)}</div>` : ''}
      </div>`;
  }).join('');
};

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
    Nav.go(Nav.currentView === 'teacher-course-detail' ? 'teacher-course-detail' : 'teacher-courses',
           _editCourseId ? { id: _editCourseId } : {});
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
  _editAsgnId     = asgnId;
  _defaultCourseId = courseId;
  const title  = $('#modal-asgn-title');
  const form   = $('#modal-asgn-form');
  const select = form?.querySelector('[name="courseId"]');
  if (!form || !select) return;

  // Populate course select
  const user = Session.get();
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
  const form    = $('#modal-asgn-form');
  const title   = form.querySelector('[name="title"]').value.trim();
  const desc    = form.querySelector('[name="description"]').value.trim();
  const dueDate = form.querySelector('[name="dueDate"]').value;
  const points  = parseInt(form.querySelector('[name="points"]').value, 10);
  const courseId= form.querySelector('[name="courseId"]').value;

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
  if (!confirm('¿Eliminar este curso? También se eliminarán sus tareas.')) return;
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
  const a = DB.assignments.byId(id);
  const cid = a?.courseId || returnCourseId;
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
    const maxEl = form.querySelector('#grade-max');
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
  // Refresh current view
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
  const user = Session.get();
  const existing = DB.submissions.get(asgnId, user.id);
  form.querySelector('[name="content"]').value  = existing?.content  || '';
  form.querySelector('[name="fileName"]').value = existing?.fileName || '';
  Modal.open('submit');
}

function saveSubmit(e) {
  e.preventDefault();
  const form     = $('#modal-submit-form');
  const content  = form.querySelector('[name="content"]').value.trim();
  const fileName = form.querySelector('[name="fileName"]').value.trim();
  if (!content) { toast('El contenido de la entrega es requerido', 'error'); return; }
  const user = Session.get();
  DB.submissions.submit({ assignmentId: _submitAsgnId, studentId: user.id, content, fileName });
  toast('Tarea entregada exitosamente', 'success');
  Modal.close();
  Nav.go('student-assignment-detail', { id: _submitAsgnId });
}

/* ── Join Course Modal ── */
function openJoinModal() {
  const form = $('#modal-join-form');
  if (form) form.reset();
  Modal.open('join');
}

function saveJoin(e) {
  e.preventDefault();
  const form = $('#modal-join-form');
  const code = form.querySelector('[name="code"]').value.trim().toUpperCase();
  if (!code) { toast('Ingresa un código', 'error'); return; }
  const course = DB.courses.byCode(code);
  if (!course) { toast('Código inválido. Verifica con tu profesor.', 'error'); return; }
  const user = Session.get();
  const ok   = DB.courses.enroll(course.id, user.id);
  if (!ok) { toast('Ya estás inscrito en este curso', 'info'); Modal.close(); return; }
  toast(`Inscrito en "${course.name}" ✅`, 'success');
  Modal.close();
  Nav.go('student-courses');
}

/* ── Copy code ── */
function copyCode(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
      .then(() => toast('Código copiado', 'success'))
      .catch(() => toast('No se pudo copiar automáticamente', 'info'));
  } else {
    toast('Copia manual: ' + code, 'info');
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
    toast('Email o contraseña incorrectos', 'error');
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
  if (!email) { toast('El email es requerido', 'error'); return; }
  if (!pass || pass.length < 6) { toast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
  if (!role)  { toast('Selecciona un rol', 'error'); return; }

  const user = DB.users.create({ name, email, password: pass, role });
  if (!user) { toast('Ya existe una cuenta con ese email', 'error'); return; }
  Session.set(user);
  toast(`¡Bienvenido, ${name}! 🎉`, 'success');
  startApp(user);
}

function handleLogout() {
  Session.clear();
  location.reload();
}

/* ── Role selector ── */
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

  // Wire sidebar logout
  const logoutBtn = $('#btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Mobile hamburger
  const ham = $('#hamburger');
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebar-backdrop');
  if (ham) {
    ham.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      backdrop?.classList.toggle('show');
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      backdrop.classList.remove('show');
    });
  }

  // Modal close
  $('#modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) Modal.close();
  });
  $$('.modal-close').forEach(btn => btn.addEventListener('click', Modal.close));

  // Note: modal forms are wired via onsubmit attributes in HTML.

  // Navigate to home view
  if (user.role === 'teacher') Nav.go('teacher-overview');
  else Nav.go('student-overview');
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  DB.init();

  // Wire auth forms (defined on the page before app starts)
  $('#login-form')?.addEventListener('submit', handleLogin);
  $('#register-form')?.addEventListener('submit', handleRegister);

  // Check session
  const user = Session.get();
  if (user) {
    startApp(user);
  } else {
    show($('#auth-section'));
    hide($('#app-section'));
  }
});
