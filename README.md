# EduAgnz

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?logo=netlify)](https://app.netlify.com/)

## 📚 Descripción

**EduAgnz** es una plataforma educativa estática que gestiona tareas como una institución. Los **profesores** crean cursos y tareas, revisan entregas y califican. Los **estudiantes** se inscriben en cursos, visualizan sus asignaciones y envían sus entregas.

Todo funciona en el navegador usando `localStorage`; no se necesita servidor.

---

## 🚀 Características

### 👩‍🏫 Rol Profesor
| Función | Detalle |
|---|---|
| Gestión de cursos | Crear, editar y eliminar cursos con código de inscripción |
| Gestión de tareas | Crear, editar y eliminar tareas con fecha límite y puntos |
| Revisión de entregas | Ver las respuestas de cada estudiante por tarea |
| Calificación | Asignar puntaje y retroalimentación a cada entrega |
| Control de estudiantes | Ver y eliminar estudiantes del curso |

### 🎓 Rol Estudiante
| Función | Detalle |
|---|---|
| Inscripción a cursos | Unirse a cursos con el código provisto por el profesor |
| Ver cursos y tareas | Panel de tareas ordenadas por fecha límite |
| Entregar tareas | Enviar respuesta de texto + nombre de archivo adjunto |
| Re-entregar | Reenviar una tarea antes de que sea calificada |
| Ver calificaciones | Revisar nota y retroalimentación del profesor |

---

## 🛠️ Tecnologías

- **HTML5 + CSS3 + JavaScript (Vanilla)** – sin frameworks ni dependencias externas
- **localStorage** – persistencia de datos en el navegador
- **Netlify** – hosting estático con deploy automático

---

## 🔑 Cuentas de Demostración

Al abrir la aplicación por primera vez se crean estas cuentas de prueba:

| Rol | Email | Contraseña |
|---|---|---|
| Profesor | `profesor@eduagnz.com` | `profesor123` |
| Estudiante | `estudiante@eduagnz.com` | `estudiante123` |
| Estudiante (extra) | `ana@eduagnz.com` | `estudiante123` |

---

## 📁 Estructura del Proyecto

```
EduAgnz/
├── index.html          # Single-page application
├── css/
│   └── style.css       # Estilos globales
├── js/
│   ├── data.js         # Capa de datos (localStorage)
│   └── app.js          # Lógica de la aplicación
└── netlify.toml        # Configuración de Netlify
```

---

## ⚙️ Instalación Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jeremyagnz/EduAgnz.git
   cd EduAgnz
   ```

2. Abre `index.html` en tu navegador o sirve con cualquier servidor estático:
   ```bash
   npx serve .
   # o
   python -m http.server 8080
   ```

3. Visita `http://localhost:8080`

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas colaborar:

1. Haz un **fork** del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Jeremy Arias** – [@jeremyagnz](https://github.com/jeremyagnz)

---

> *"La educación es el arma más poderosa que puedes usar para cambiar el mundo."* — Nelson Mandela
