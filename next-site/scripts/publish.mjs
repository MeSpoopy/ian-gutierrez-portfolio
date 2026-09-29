import { cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const source = fileURLToPath(new URL('../out/', import.meta.url));
const root = fileURLToPath(new URL('../../', import.meta.url));
for (const name of await readdir(source)) {
  await cp(path.join(source,name), path.join(root,name), {recursive:true});
}
console.log('Static Next.js export copied to the GitHub Pages root. Existing case studies and assets preserved.');
