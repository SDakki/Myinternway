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

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  signupSubmit.disabled = true;
  setSignupMessage('Creando tu cuenta…', false);

  const formData = new FormData(signupForm);
  const nombre = formData.get('nombre').trim();
  const email = formData.get('email').trim();
  const password = formData.get('password');
  const paisOrigen = formData.get('pais_origen').trim();
  const cvFile = formData.get('cv');
  const fotoFile = formData.get('foto');

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nombre, pais_origen: paisOrigen },
      },
    });
    if (error) throw error;

    const userId = data.user?.id;

    // Si la confirmación de correo está activa, no hay sesión todavía:
    // el perfil se crea vía trigger en la base de datos (ver db/schema.sql)
    // y el CV/foto se suben más adelante desde una pantalla logueada.
    if (data.session && userId) {
      let cvPath = null;
      let fotoPath = null;
      if (cvFile && cvFile.size > 0) cvPath = await uploadFile(userId, cvFile, 'cv');
      if (fotoFile && fotoFile.size > 0) fotoPath = await uploadFile(userId, fotoFile, 'foto');

      const { error: profileError } = await supabaseClient.from('profiles').upsert({
        id: userId,
        nombre,
        pais_origen: paisOrigen,
        cv_url: cvPath,
        foto_url: fotoPath,
        estado_solicitud: 'pendiente',
      });
      if (profileError) throw profileError;
    }

    setSignupMessage('¡Listo! Revisa tu correo para confirmar la cuenta.', false);
    signupForm.reset();
  } catch (error) {
    setSignupMessage(error.message || 'Algo salió mal, inténtalo de nuevo.', true);
  } finally {
    signupSubmit.disabled = false;
  }
});
