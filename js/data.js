/* ============================================================
   EduAgnz – Data Layer  (localStorage)
   ============================================================ */

const DB = (() => {

  const PREFIX = 'eduagnz_';
  const INIT_KEY = PREFIX + 'v1_initialized';

  /* ── helpers ── */
  function raw(key) {
    try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; }
  }
  function store(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }
  function list(key) { return raw(key) || []; }

  /* ── seed / init ── */
  function init() {
    if (localStorage.getItem(INIT_KEY)) return;
    seed();
    localStorage.setItem(INIT_KEY, '1');
  }

  function reset() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
    seed();
    localStorage.setItem(INIT_KEY, '1');
  }

  function seed() {
    const now = new Date();
    function daysFromNow(n) {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    }

    store('users', [
      { id: 'u1', name: 'Prof. María González', email: 'profesor@eduagnz.com', password: 'profesor123', role: 'teacher' },
      { id: 'u2', name: 'Carlos Rodríguez',    email: 'estudiante@eduagnz.com', password: 'estudiante123', role: 'student' },
      { id: 'u3', name: 'Ana López',           email: 'ana@eduagnz.com',        password: 'estudiante123', role: 'student' },
    ]);

    store('courses', [
      { id: 'c1', name: 'Matemáticas II',   description: 'Álgebra lineal y cálculo diferencial e integral.', teacherId: 'u1', code: 'MAT201', color: 'color-blue',   studentIds: ['u2','u3'], createdAt: now.toISOString() },
      { id: 'c2', name: 'Física General',   description: 'Mecánica clásica, termodinámica y electromagnetismo.', teacherId: 'u1', code: 'FIS101', color: 'color-green',  studentIds: ['u2'],      createdAt: now.toISOString() },
      { id: 'c3', name: 'Programación I',   description: 'Fundamentos de programación con Python.', teacherId: 'u1', code: 'PRG101', color: 'color-purple', studentIds: ['u3'],      createdAt: now.toISOString() },
    ]);

    store('assignments', [
      { id: 'a1', title: 'Límites y Continuidad',   description: 'Resolver los ejercicios del capítulo 3 sobre límites. Mostrar procedimiento completo en cada punto. Se evaluará claridad y exactitud.', dueDate: daysFromNow(8),  points: 100, courseId: 'c1', teacherId: 'u1', createdAt: now.toISOString() },
      { id: 'a2', title: 'Taller de Derivadas',      description: 'Resolver los ejercicios pares del capítulo 5. Incluir regla de la cadena, producto y cociente donde aplique.',                        dueDate: daysFromNow(15), points: 50,  courseId: 'c1', teacherId: 'u1', createdAt: now.toISOString() },
      { id: 'a3', title: 'Leyes de Newton',          description: 'Aplicar las tres leyes de Newton a los 10 problemas propuestos. Presentar diagrama de cuerpo libre en cada caso.',                    dueDate: daysFromNow(5),  points: 75,  courseId: 'c2', teacherId: 'u1', createdAt: now.toISOString() },
      { id: 'a4', title: 'Primer Parcial – Mecánica',description: 'Evaluación parcial de mecánica clásica: cinemática, dinámica y trabajo-energía.',                                                     dueDate: daysFromNow(20), points: 200, courseId: 'c2', teacherId: 'u1', createdAt: now.toISOString() },
    ]);

    store('submissions', []);
  }

  /* ── generic id ── */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ============================================================
     USERS
     ============================================================ */
  const users = {
    all()          { return list('users'); },
    byId(id)       { return users.all().find(u => u.id === id); },
    byEmail(email) { return users.all().find(u => u.email.toLowerCase() === email.toLowerCase()); },
    save(user) {
      const arr = users.all();
      const i = arr.findIndex(u => u.id === user.id);
      if (i >= 0) arr[i] = user; else arr.push(user);
      store('users', arr);
    },
    create({ name, email, password, role }) {
      if (users.byEmail(email)) return null; // duplicate
      const user = { id: genId(), name, email, password, role };
      const arr = users.all();
      arr.push(user);
      store('users', arr);
      return user;
    },
  };

  /* ============================================================
     COURSES
     ============================================================ */
  const COLORS = ['color-blue','color-green','color-purple','color-amber','color-pink'];
  const courses = {
    all()              { return list('courses'); },
    byId(id)           { return courses.all().find(c => c.id === id); },
    byCode(code)       { return courses.all().find(c => c.code.toLowerCase() === code.toLowerCase()); },
    byTeacher(tid)     { return courses.all().filter(c => c.teacherId === tid); },
    byStudent(sid)     { return courses.all().filter(c => (c.studentIds || []).includes(sid)); },
    save(course) {
      const arr = courses.all();
      const i = arr.findIndex(c => c.id === course.id);
      if (i >= 0) arr[i] = course; else arr.push(course);
      store('courses', arr);
    },
    create({ name, description, teacherId }) {
      const code = name.slice(0,3).toUpperCase() + Math.floor(100 + Math.random() * 900);
      const color = COLORS[courses.all().length % COLORS.length];
      const course = { id: genId(), name, description, teacherId, code, color, studentIds: [], createdAt: new Date().toISOString() };
      const arr = courses.all();
      arr.push(course);
      store('courses', arr);
      return course;
    },
    delete(id) { store('courses', courses.all().filter(c => c.id !== id)); },
    enroll(courseId, studentId) {
      const c = courses.byId(courseId);
      if (!c) return false;
      if ((c.studentIds || []).includes(studentId)) return false;
      c.studentIds = [...(c.studentIds || []), studentId];
      courses.save(c);
      return true;
    },
    unenroll(courseId, studentId) {
      const c = courses.byId(courseId);
      if (!c) return;
      c.studentIds = (c.studentIds || []).filter(id => id !== studentId);
      courses.save(c);
    },
  };

  /* ============================================================
     ASSIGNMENTS
     ============================================================ */
  const assignments = {
    all()             { return list('assignments'); },
    byId(id)          { return assignments.all().find(a => a.id === id); },
    byCourse(cid)     { return assignments.all().filter(a => a.courseId === cid); },
    byTeacher(tid)    { return assignments.all().filter(a => a.teacherId === tid); },
    save(asgn) {
      const arr = assignments.all();
      const i = arr.findIndex(a => a.id === asgn.id);
      if (i >= 0) arr[i] = asgn; else arr.push(asgn);
      store('assignments', arr);
    },
    create({ title, description, dueDate, points, courseId, teacherId }) {
      const asgn = { id: genId(), title, description, dueDate, points: parseInt(points, 10), courseId, teacherId, createdAt: new Date().toISOString() };
      const arr = assignments.all();
      arr.push(asgn);
      store('assignments', arr);
      return asgn;
    },
    delete(id) { store('assignments', assignments.all().filter(a => a.id !== id)); },
  };

  /* ============================================================
     SUBMISSIONS
     ============================================================ */
  const submissions = {
    all()                   { return list('submissions'); },
    byId(id)                { return submissions.all().find(s => s.id === id); },
    byAssignment(aid)       { return submissions.all().filter(s => s.assignmentId === aid); },
    byStudent(sid)          { return submissions.all().filter(s => s.studentId === sid); },
    get(assignmentId, studentId) {
      return submissions.all().find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    },
    save(sub) {
      const arr = submissions.all();
      const i = arr.findIndex(s => s.id === sub.id);
      if (i >= 0) arr[i] = sub; else arr.push(sub);
      store('submissions', arr);
    },
    submit({ assignmentId, studentId, content, fileName }) {
      const existing = submissions.get(assignmentId, studentId);
      if (existing) {
        // resubmit
        existing.content   = content;
        existing.fileName  = fileName || null;
        existing.submittedAt = new Date().toISOString();
        existing.grade     = null;
        existing.feedback  = null;
        submissions.save(existing);
        return existing;
      }
      const sub = { id: genId(), assignmentId, studentId, content, fileName: fileName || null, submittedAt: new Date().toISOString(), grade: null, feedback: null };
      const arr = submissions.all();
      arr.push(sub);
      store('submissions', arr);
      return sub;
    },
    grade(subId, { grade, feedback }) {
      const sub = submissions.byId(subId);
      if (!sub) return null;
      sub.grade    = parseInt(grade, 10);
      sub.feedback = feedback || null;
      sub.gradedAt = new Date().toISOString();
      submissions.save(sub);
      return sub;
    },
    delete(id) { store('submissions', submissions.all().filter(s => s.id !== id)); },
  };

  /* ── public ── */
  return { init, reset, genId, users, courses, assignments, submissions };
})();
