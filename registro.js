// Maneja el alta de cuentas contra Supabase Auth + Storage.
const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');
const signupSubmit = document.getElementById('signupSubmit');

const BUCKET = 'perfiles';

function setSignupMessage(text, isError) {
  if (!signupMessage) return;
  signupMessage.textContent = text;
  signupMessage.classList.toggle('is-error', Boolean(isError));
}

function t(key, defaultVal) {
  return window.myinternwayI18n ? window.myinternwayI18n.t(key) : defaultVal;
}

function renderStatusBadge(statusEl, estado) {
  if (!statusEl) return;
  if (estado === 'aceptado') {
    statusEl.textContent = t('dash_status_accepted', 'Aceptado ✓');
    statusEl.className = 'status-pill status-accepted';
  } else if (estado === 'en_revision') {
    statusEl.textContent = t('dash_status_review', 'En revisión ⏳');
    statusEl.className = 'status-pill status-en_revision';
  } else if (estado === 'rechazado') {
    statusEl.textContent = t('dash_status_rejected', 'Rechazado ✕');
    statusEl.className = 'status-pill status-rejected';
  } else {
    statusEl.textContent = t('dash_status_pending', 'Pendiente ⏳');
    statusEl.className = 'status-pill status-pending';
  }
}

function handleSignupSubmission(form, submitBtn, msgEl) {
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (msgEl) {
      msgEl.textContent = t('msg_creating', 'Creando tu cuenta…');
      msgEl.classList.remove('is-error');
    }

    const formData = new FormData(form);
    const nombre = (formData.get('nombre') || '').toString().trim();
    const apellidos = (formData.get('apellidos') || '').toString().trim();
    const nombreCompleto = apellidos ? `${nombre} ${apellidos}`.trim() : nombre;
    const email = (formData.get('email') || '').toString().trim();
    const password = (formData.get('password') || '').toString();
    const paisOrigen = (formData.get('pais_origen') || '').toString().trim();

    const siteRedirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : 'https://www.myinternway.com';

    try {
      // 1. CREA EL USUARIO EN AUTH.USERS
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteRedirectUrl,
          data: { nombre: nombreCompleto, primer_nombre: nombre, apellidos, pais_origen: paisOrigen },
        },
      });
      if (error) throw error;

      const userId = data.user?.id;

      // 2. GUARDA LOS DATOS EN LA TABLA PROFILES
      if (userId) {
        const { error: profileError } = await supabaseClient.from('profiles').upsert({
          id: userId,
          nombre: nombreCompleto,
          pais_origen: paisOrigen,
          estado_solicitud: 'pendiente'
        });
        if (profileError) console.warn('Error guardando en profiles:', profileError);
      }

      if (msgEl) {
        if (data.session) {
          msgEl.textContent = t('msg_success_logged', '¡Cuenta creada con éxito! Ya puedes acceder a tu panel.');
        } else {
          msgEl.textContent = t('msg_success', '¡Listo! Revisa tu correo para confirmar la cuenta.');
        }
        msgEl.classList.remove('is-error');
      }
      form.reset();
      if (data.session) {
        await checkUserSession(data.session);
      }
    } catch (error) {
      if (msgEl) {
        msgEl.textContent = error.message || t('msg_error_default', 'Algo salió mal, inténtalo de nuevo.');
        msgEl.classList.add('is-error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Iniciar modales
const studentModalForm = document.getElementById('studentModalForm');
const studentModalSubmit = document.getElementById('studentModalSubmit');
const studentModalMsg = document.getElementById('studentModalMsg');
handleSignupSubmission(studentModalForm, studentModalSubmit, studentModalMsg);

// Iniciar sesión (Login)
const loginModalForm = document.getElementById('loginModalForm');
const loginModalSubmit = document.getElementById('loginModalSubmit');
const loginModalMsg = document.getElementById('loginModalMsg');

loginModalForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (loginModalSubmit) loginModalSubmit.disabled = true;
  if (loginModalMsg) {
    loginModalMsg.textContent = t('msg_creating', 'Iniciando sesión…');
    loginModalMsg.classList.remove('is-error');
  }

  const formData = new FormData(loginModalForm);
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    loginModalForm.reset();
    if (loginModalMsg) loginModalMsg.textContent = '';
    if (window.closeModal) window.closeModal(document.getElementById('loginModal'));

    // 1. Guardar en storage local para visualización instantánea y fiable
    if (data.session && data.user) {
      const u = data.user;
      let cachedName = u.user_metadata?.nombre || u.user_metadata?.primer_nombre || '';
      let cachedCountry = u.user_metadata?.pais_origen || '';
      let cachedStatus = 'pendiente';

      // Consultar tabla profiles inmediatamente
      try {
        const { data: prof } = await supabaseClient
          .from('profiles')
          .select('nombre, pais_origen, estado_solicitud')
          .eq('id', u.id)
          .maybeSingle();
        if (prof) {
          if (prof.nombre) cachedName = prof.nombre;
          if (prof.pais_origen) cachedCountry = prof.pais_origen;
          if (prof.estado_solicitud) cachedStatus = prof.estado_solicitud;
        }
      } catch (err) {
        console.warn(err);
      }

      localStorage.setItem('myinternway_user_name', cachedName);
      localStorage.setItem('myinternway_user_country', cachedCountry);
      localStorage.setItem('myinternway_user_email', u.email || email);
      localStorage.setItem('myinternway_user_status', cachedStatus);

      // Inyectar datos en el DOM inmediatamente
      const dashUserName = document.getElementById('dashUserName');
      const dashUserEmail = document.getElementById('dashUserEmail');
      const dashUserCountry = document.getElementById('dashUserCountry');
      const dashUserStatus = document.getElementById('dashUserStatus');
      const navLoginBtn = document.getElementById('navLoginBtn');

      if (dashUserName) dashUserName.textContent = cachedName || u.email || '-';
      if (dashUserEmail) dashUserEmail.textContent = u.email || email || '-';
      if (dashUserCountry) dashUserCountry.textContent = cachedCountry || '-';
      if (dashUserStatus) {
        renderStatusBadge(dashUserStatus, cachedStatus);
      }
      if (navLoginBtn) {
        const pName = cachedName ? cachedName.split(' ')[0] : (u.email ? u.email.split('@')[0] : 'Mi cuenta');
        navLoginBtn.textContent = pName;
        navLoginBtn.removeAttribute('data-i18n');
        navLoginBtn.classList.add('nav-user-active');
      }
    }
    
    await checkUserSession(data.session);
    if (window.openModal) window.openModal(document.getElementById('dashboardModal'));
  } catch (error) {
    if (loginModalMsg) {
      let errorMsg = error.message;
      if (errorMsg === 'Invalid login credentials') {
        errorMsg = t('msg_error_credentials', 'Correo o contraseña incorrectos.');
      } else if (errorMsg === 'Email not confirmed') {
        errorMsg = t('msg_error_not_confirmed', 'Debes confirmar tu correo antes de iniciar sesión.');
      }
      loginModalMsg.textContent = errorMsg || t('msg_error_default', 'Credenciales incorrectas');
      loginModalMsg.classList.add('is-error');
    }
  } finally {
    if (loginModalSubmit) loginModalSubmit.disabled = false;
  }
});

// Comprobar y pintar sesión actual
async function checkUserSession(forcedSession = null) {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const dashUserName = document.getElementById('dashUserName');
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashUserCountry = document.getElementById('dashUserCountry');
  const dashUserStatus = document.getElementById('dashUserStatus');

  if (!window.supabaseClient) return;

  let session = forcedSession;
  if (!session) {
    try {
      const res = await supabaseClient.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn('Error getSession:', e);
    }
  }
  window._currentSession = session;
  const user = session?.user;

  if (!user) {
    if (navLoginBtn) {
      navLoginBtn.setAttribute('data-i18n', 'nav_login');
      navLoginBtn.textContent = t('nav_login', 'Log in');
      navLoginBtn.classList.remove('nav-user-active');
    }
    if (dashUserEmail) dashUserEmail.textContent = '-';
    if (dashUserName) dashUserName.textContent = '-';
    if (dashUserCountry) dashUserCountry.textContent = '-';
    if (dashUserStatus) {
      dashUserStatus.textContent = '-';
      dashUserStatus.className = 'status-pill';
    }
    return;
  }

  // 1. Obtener valores con múltiples fuentes de respaldo
  let email = user.email || localStorage.getItem('myinternway_user_email') || '';
  let nombre = user.user_metadata?.nombre || user.user_metadata?.primer_nombre || localStorage.getItem('myinternway_user_name') || '';
  let pais = user.user_metadata?.pais_origen || localStorage.getItem('myinternway_user_country') || '';
  let estado = localStorage.getItem('myinternway_user_status') || 'pendiente';

  // 2. Pintar inmediatamente
  let primerNombre = nombre ? nombre.split(' ')[0] : (email ? email.split('@')[0] : 'Mi cuenta');
  if (navLoginBtn) {
    navLoginBtn.textContent = primerNombre;
    navLoginBtn.removeAttribute('data-i18n');
    navLoginBtn.classList.add('nav-user-active');
  }
  if (dashUserName) dashUserName.textContent = nombre || email || '-';
  if (dashUserEmail) dashUserEmail.textContent = email || '-';
  if (dashUserCountry) dashUserCountry.textContent = pais || '-';
  if (dashUserStatus) {
    renderStatusBadge(dashUserStatus, estado);
  }

  // 3. Consultar la tabla profiles en la base de datos
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('nombre, pais_origen, estado_solicitud')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      if (profile.nombre) {
        nombre = profile.nombre;
        localStorage.setItem('myinternway_user_name', nombre);
      }
      if (profile.pais_origen) {
        pais = profile.pais_origen;
        localStorage.setItem('myinternway_user_country', pais);
      }
      if (profile.estado_solicitud) {
        estado = profile.estado_solicitud;
        localStorage.setItem('myinternway_user_status', estado);
      }

      primerNombre = nombre ? nombre.split(' ')[0] : (email ? email.split('@')[0] : 'Mi cuenta');
      if (navLoginBtn) navLoginBtn.textContent = primerNombre;
      if (dashUserName) dashUserName.textContent = nombre || email || '-';
      if (dashUserCountry) dashUserCountry.textContent = pais || '-';
      if (dashUserStatus) {
        renderStatusBadge(dashUserStatus, estado);
      }
    }
  } catch (err) {
    console.warn('Aviso profiles:', err);
  }
}

window.checkUserSession = checkUserSession;

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn?.addEventListener('click', async () => {
  if (window.supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    }
  }

  // Limpiar almacenamiento local
  localStorage.removeItem('myinternway_user_name');
  localStorage.removeItem('myinternway_user_country');
  localStorage.removeItem('myinternway_user_email');
  localStorage.removeItem('myinternway_user_status');

  // Cerrar el modal del panel de candidato
  const dashModal = document.getElementById('dashboardModal');
  if (window.closeModal && dashModal) {
    window.closeModal(dashModal);
  } else if (dashModal) {
    dashModal.hidden = true;
    document.body.style.overflow = '';
  }

  // Resetear la interfaz
  const navLoginBtn = document.getElementById('navLoginBtn');
  const dashUserName = document.getElementById('dashUserName');
  const dashUserEmail = document.getElementById('dashUserEmail');
  const dashUserCountry = document.getElementById('dashUserCountry');
  const dashUserStatus = document.getElementById('dashUserStatus');

  if (navLoginBtn) {
    navLoginBtn.setAttribute('data-i18n', 'nav_login');
    navLoginBtn.textContent = t('nav_login', 'Log in');
    navLoginBtn.classList.remove('nav-user-active');
  }
  if (dashUserEmail) dashUserEmail.textContent = '-';
  if (dashUserName) dashUserName.textContent = '-';
  if (dashUserCountry) dashUserCountry.textContent = '-';
  if (dashUserStatus) {
    dashUserStatus.textContent = '-';
    dashUserStatus.className = 'status-pill';
  }

  await checkUserSession();
});

if (window.supabaseClient) {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    checkUserSession();
  });
}

document.addEventListener('DOMContentLoaded', () => checkUserSession());