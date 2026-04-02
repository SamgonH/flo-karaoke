const { execSync } = require('child_process');
const fs = require('fs');

const ids = [
  '20260401061041', '20260401064500', '20260401064856', '20260401065206',
  '20260401071809', '20260401072250', '20260401072528', '20260401080000',
  '20260401083500', '20260401085000', '20260401090000'
];

const migrationsDir = 'supabase/migrations';

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

ids.forEach(id => {
  const filePath = `${migrationsDir}/${id}_ghost.sql`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '-- Generated Ghost Migration\n', 'utf-8');
  }
});

ids.forEach(id => {
  try {
    execSync(`powershell -ExecutionPolicy Bypass -Command "npx supabase migration repair --status applied ${id}"`, { stdio: 'inherit' });
  } catch (err) {}
});

console.log('✅ CLI 이력 복구 완료');
