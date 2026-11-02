import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
await mkdir('assets/marsad', {recursive: true});
await build({entryPoints: ['src/marsad/entry.tsx'], bundle: true, minify: true, sourcemap: false, format: 'esm', platform: 'browser', target: 'es2022', jsx: 'automatic', outfile: 'assets/marsad/app.js', define: {'process.env.NODE_ENV': '"production"'}, legalComments: 'eof'});
await build({entryPoints: ['src/marsad/style.css'], minify: true, outfile: 'assets/marsad/style.css'});
console.log('Marsad client assets built.');
