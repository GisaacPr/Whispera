import './realistic-folder.css';
import {useEffect, useRef} from 'react';
import type {RealisticFolderMode, RealisticFolderScene} from './realistic-folder-scene';

const WIDTH = 321, HEIGHT = 270;

// three.js is loaded on demand so the other folder models never pay for it.
export default function RealisticFolder({mode='idle',time='00:00'}:{mode?:RealisticFolderMode;time?:string}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const scene=useRef<RealisticFolderScene|null>(null);
  const modeRef=useRef(mode),timeRef=useRef(time);
  timeRef.current=time;
  // Device pixels per canvas pixel as displayed (including the recorder's CSS scaling), doubled:
  // an exact 2:1 reduction averages each 2x2 block, smoothing the thin gold edges (supersampling).
  const shownRatio=()=>2*(window.devicePixelRatio||1)*((canvas.current?.getBoundingClientRect().width||WIDTH)/WIDTH);
  modeRef.current=mode;
  useEffect(()=>{
    let cancelled=false;
    const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
    import('./realistic-folder-scene').then(({createRealisticFolderScene})=>{
      if(cancelled||!canvas.current)return;
      try {
        scene.current=createRealisticFolderScene(canvas.current,WIDTH,HEIGHT,reducedMotion);
        scene.current.setPixelRatio(shownRatio());
        scene.current.setTime(timeRef.current);
        scene.current.setMode(modeRef.current);
      } catch(error) {
        console.error('Realistic folder unavailable',error);
      }
    }).catch(error=>console.error('Realistic folder failed to load',error));
    return ()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  },[]);
  useEffect(()=>{scene.current?.setPixelRatio(shownRatio());scene.current?.setMode(mode);},[mode]);
  useEffect(()=>{scene.current?.setTime(time);},[time]);
  useEffect(()=>{
    const resize=()=>scene.current?.setPixelRatio(shownRatio());
    window.addEventListener('resize',resize);
    return ()=>window.removeEventListener('resize',resize);
  },[]);
  return <span className="realistic-folder" data-mode={mode} data-hit="indicator-object">
    <canvas ref={canvas} width={WIDTH} height={HEIGHT} role="img" aria-label="Carpeta realista 3D"/>
  </span>;
}
