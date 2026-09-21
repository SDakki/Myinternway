// Claves públicas de Supabase (la "anon key" está diseñada para exponerse en el navegador;
// la seguridad real la da Row Level Security en la base de datos, ver db/schema.sql).
// Reemplaza estos dos valores por los de tu proyecto en Supabase > Settings > API.
const SUPABASE_URL = 'https://otzaaksfrzbqakduueao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90emFha3NmcnpicWFrZHV1ZWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODk5OTgsImV4cCI6MjEwNTU2NTk5OH0.terinVmPEZUNFZj5HrwAf9rpcXFso3u4n0JR9cTDlGA';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
