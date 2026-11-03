import {build} from 'esbuild';
import {mkdir,readFile} from 'node:fs/promises';
await mkdir('assets/marsad', {recursive: true});
await build({entryPoints: ['src/marsad/entry.tsx'], bundle: true, minify: true, sourcemap: false, format: 'esm', platform: 'browser', target: 'es2022', jsx: 'automatic', outfile: 'assets/marsad/app.js', define: {'process.env.NODE_ENV': '"production"'}, legalComments: 'eof'});
const styles = await Promise.all(['src/marsad/style.css','src/marsad/workspace.css'].map(path => readFile(path,'utf8')));
await build({stdin:{contents:styles.join('\n'),loader:'css'}, minify:true, outfile:'assets/marsad/style.css'});
console.log('Marsad client assets built.');
