// Maneja el alta de cuentas contra Supabase Auth + Storage.
// Requiere que supabase-config.js ya haya inicializado `supabaseClient`.
const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');
const signupSubmit = document.getElementById('signupSubmit');

const BUCKET = 'perfiles';

function setSignupMessage(text, isError) {
  signupMessage.textContent = text;
  signupMessage.classList.toggle('is-error', Boolean(isError));
}

async function uploadFile(userId, file, kind) {
  const extension = file.name.split('.').pop();
  const path = `${userId}/${kind}.${extension}`;
  const { error } = await supabaseClient.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

function t(key, defaultVal) {
  return window.myinternwayI18n ? window.myinternwayI18n.t(key) : defaultVal;
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

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { nombre: nombreCompleto, primer_nombre: nombre, apellidos, pais_origen: paisOrigen },
        },
      });
      if (error) throw error;

      const userId = data.user?.id;

      if (data.session && userId) {
        const { error: profileError } = await supabaseClient.from('profiles').upsert({
          id: userId,
          nombre: nombreCompleto,
          pais_origen: paisOrigen,
          estado_solicitud: 'pendiente',
        });
        if (profileError) throw profileError;
      }

      if (msgEl) {
        msgEl.textContent = t('msg_success', '¡Listo! Revisa tu correo para confirmar la cuenta.');
        msgEl.classList.remove('is-error');
      }
      form.reset();
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

// Iniciar modal de estudiante
const studentModalForm = document.getElementById('studentModalForm');
const studentModalSubmit = document.getElementById('studentModalSubmit');
const studentModalMsg = document.getElementById('studentModalMsg');
handleSignupSubmission(studentModalForm, studentModalSubmit, studentModalMsg);
