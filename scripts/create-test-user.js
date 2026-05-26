const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

async function createUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'lucas@adsgator.com.br',
      password: 'Senha123!@#',
      email_confirm: true,
    });

    if (error) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('Email: lucas@adsgator.com.br');
      console.log('Senha: Senha123!@#');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

createUser();
