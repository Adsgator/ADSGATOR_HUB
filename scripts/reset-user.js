const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

async function resetUser() {
  try {
    // Primeiro, encontra o usuário
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === 'lucas@adsgator.com.br');

    if (!user) {
      console.error('❌ Usuário lucas@adsgator.com.br não encontrado');
      process.exit(1);
    }

    // Atualiza a senha
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'Senha123!@#',
    });

    if (error) {
      console.error('❌ Erro ao resetar senha:', error.message);
      process.exit(1);
    }

    console.log('✅ Senha resetada com sucesso!');
    console.log('Email: lucas@adsgator.com.br');
    console.log('Senha: Senha123!@#');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

resetUser();
