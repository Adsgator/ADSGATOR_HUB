const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

async function deleteAndCreateUser() {
  try {
    const email = 'lucas@adsgator.com.br';
    const password = 'senha123';

    // Listar usuários para encontrar o ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      process.exit(1);
    }

    const user = users.find(u => u.email === email);

    // Deletar se existir
    if (user) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError.message);
        process.exit(1);
      }
      console.log('✅ Usuário anterior deletado');
    }

    // Criar novo usuário
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      process.exit(1);
    }

    console.log('✅ Novo usuário criado com sucesso!');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

deleteAndCreateUser();
