import { rm, mkdir, cp } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('src/index.html','dist/index.html');
await cp('src/styles.css','dist/styles.css');
await cp('src/app.mjs','dist/app.mjs');
await cp('src/domain.mjs','dist/domain.mjs');
await cp('src/storage.mjs','dist/storage.mjs');
console.log('Build estático criado em dist/.');
