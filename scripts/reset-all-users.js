const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

async function resetAllUsers() {
  try {
    // 1. Listar todos os usuários
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      process.exit(1);
    }

    console.log(`📋 Encontrados ${users.length} usuário(s) para deletar`);

    // 2. Deletar todos os usuários
    for (const user of users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`❌ Erro ao deletar ${user.email}:`, deleteError.message);
      } else {
        console.log(`🗑️  Deletado: ${user.email}`);
      }
    }

    // 3. Criar novo usuário
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: 'test@hub.com',
      password: '1234V',
      email_confirm: true,
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError.message);
      process.exit(1);
    }

    console.log('\n✅ Usuário criado com sucesso!');
    console.log('Email: test@hub.com');
    console.log('Senha: 1234V');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

resetAllUsers();
