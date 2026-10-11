import sizeOf from 'image-size';
import path from 'node:path';
import { readFileSync } from 'node:fs';
// aspect ratio (w/h) computed at build from the file in public/images
export function ar(src){
  src = src.replace(/^\/images\//,'');
  try{ const d=sizeOf(readFileSync(path.join(process.cwd(),'public','images',src))); return +(d.width/d.height).toFixed(4); }
  catch(e){ return 1.5; }
}
