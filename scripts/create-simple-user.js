const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jymybemmnzgfzmslpmcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bXliZW1tbnpnZnptc2xwbWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3NjkzNiwiZXhwIjoyMDk0OTUyOTM2fQ.BKA6RYFoWEuI7mRZOzJDqaC6D-7eGpIDyC9_FEsUh88'
);

async function createUser() {
  try {
    // Tenta criar um novo usuário com email diferente
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@adsgator.com.br',
      password: 'senha123',
      email_confirm: true,
    });

    if (error) {
      console.error('❌ Erro:', error.message);
      // Se falhar porque já existe, tenta resetar a senha
      if (error.message.includes('already been registered')) {
        console.log('\n📝 Usuário já existe. Use as credenciais:');
        console.log('Email: lucas@adsgator.com.br');
        console.log('Senha: senha123');
      }
      process.exit(1);
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email: test@adsgator.com.br');
    console.log('Senha: senha123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

createUser();
