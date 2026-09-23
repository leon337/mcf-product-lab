import { execFileSync } from 'node:child_process';
const files=['src/domain.mjs','src/storage.mjs','src/app.mjs','server.mjs','scripts/build.mjs'];
for (const file of files) execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
console.log('Sintaxe JavaScript validada.');
