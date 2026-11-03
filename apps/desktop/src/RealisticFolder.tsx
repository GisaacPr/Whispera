import './realistic-folder.css';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import type {RealisticFolderMode, RealisticFolderScene} from './realistic-folder-scene';

const WIDTH = 321, HEIGHT = 270;

// three.js is loaded on demand so the other folder models never pay for it.
// Without WebGL (old drivers, a GPU reset) it shows `fallback` instead of an empty recorder.
export default function RealisticFolder({mode='idle',time='00:00',color,fallback=null}:{mode?:RealisticFolderMode;time?:string;color?:string;fallback?:ReactNode}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const scene=useRef<RealisticFolderScene|null>(null);
  const [failed,setFailed]=useState(false);
  const modeRef=useRef(mode),timeRef=useRef(time),colorRef=useRef(color);
  timeRef.current=time;
  colorRef.current=color;
  // Device pixels per canvas pixel as displayed (including the recorder's CSS scaling), doubled:
  // an exact 2:1 reduction averages each 2x2 block, smoothing the thin gold edges (supersampling).
  const shownRatio=()=>2*(window.devicePixelRatio||1)*((canvas.current?.getBoundingClientRect().width||WIDTH)/WIDTH);
  modeRef.current=mode;
  useEffect(()=>{
    if(failed)return;
    let cancelled=false;
    const element=canvas.current;
    const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
    // A context lost while showing (GPU reset) falls back too; our own dispose removes this first.
    const lost=(event:Event)=>{event.preventDefault();if(!cancelled)setFailed(true);};
    element?.addEventListener('webglcontextlost',lost);
    import('./realistic-folder-scene').then(({createRealisticFolderScene})=>{
      if(cancelled||!canvas.current)return;
      try {
        scene.current=createRealisticFolderScene(canvas.current,WIDTH,HEIGHT,reducedMotion);
        scene.current.setPixelRatio(shownRatio());
        scene.current.setColor(colorRef.current);
        scene.current.setTime(timeRef.current);
        scene.current.setMode(modeRef.current);
      } catch(error) {
        console.error('Realistic folder unavailable',error);
        setFailed(true);
      }
    }).catch(error=>{console.error('Realistic folder failed to load',error);if(!cancelled)setFailed(true);});
    return ()=>{cancelled=true;element?.removeEventListener('webglcontextlost',lost);scene.current?.dispose();scene.current=null;};
  },[failed]);
  useEffect(()=>{scene.current?.setPixelRatio(shownRatio());scene.current?.setMode(mode);},[mode]);
  useEffect(()=>{scene.current?.setTime(time);},[time]);
  useEffect(()=>{scene.current?.setColor(color);},[color]);
  useEffect(()=>{
    const resize=()=>scene.current?.setPixelRatio(shownRatio());
    window.addEventListener('resize',resize);
    return ()=>window.removeEventListener('resize',resize);
  },[]);
  if(failed)return <>{fallback}</>;
  return <span className="realistic-folder" data-mode={mode} data-hit="indicator-object">
    <canvas ref={canvas} width={WIDTH} height={HEIGHT} role="img" aria-label="Carpeta realista 3D"/>
  </span>;
}
