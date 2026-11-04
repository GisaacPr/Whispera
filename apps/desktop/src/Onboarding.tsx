import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Cloud, Cpu, HardDrive } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import * as api from './client';
import './onboarding.css';
import GroqKeyGuide from './GroqKeyGuide';
import HotkeyInput from './HotkeyInput';
import { formatHotkey } from './hotkey-capture';
import { LocalEngine } from './LocalEngine';
import MacPermissions from './MacPermissions';
import { credentialStore, isMac, systemName } from './platform';

type Info = { complete: boolean; startup: boolean; microphone: string | null };
export function SetupGate({ children }: { children: React.ReactNode }) {
  const [needed, setNeeded] = useState<boolean>();
  const [error, setError] = useState('');
  const check = () => {
    setError('');
    if (!api.native) { setNeeded(new URLSearchParams(location.search).has('setup')); return; }
    invoke<Info>('setup_info').then(s => setNeeded(!s.complete)).catch(() => setError('Cannot load setup / No se pudo cargar la configuracion'));
  };
  useEffect(check, []);
  if (error) return <main className="setup-shell" role="alert">{error}<button onClick={check}>Retry / Reintentar</button></main>;
  if (needed === undefined) return <main className="setup-shell" role="status">Whispera</main>;
  return needed ? <Onboarding onDone={() => setNeeded(false)} /> : children;
}

// The shortcut drawn as physical keys: the one thing this setup is building toward.
function Keycaps({ hotkey }: { hotkey: string }) {
  const keys = formatHotkey(hotkey).split('+').map(k => k.trim()).filter(Boolean);
  return <span className="setup-keys" aria-label={formatHotkey(hotkey)}>{keys.map((key, i) => <kbd key={i}>{key}</kbd>)}</span>;
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [lang, setLang] = useState<'es' | 'en'>(navigator.language.startsWith('es') ? 'es' : 'en');
  const t = (es: string, en: string) => lang === 'es' ? es : en;
  const [step, setStep] = useState(0);
  const [key, setKey] = useState('');
  const [configured, setConfigured] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [settings, setSettings] = useState<api.Settings>();
  const [info, setInfo] = useState<Info>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    const data = await api.snapshot(); setSettings(data.settings); setConfigured(data.keyConfigured);
    if (api.native) setInfo(await invoke<Info>('setup_info'));
    else setInfo({ complete: false, startup: false, microphone: null });
  };
  useEffect(() => { void load().catch(e => setError(String(e))); }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(String(e)); } finally { setBusy(false); }
  }
  // Engine and model choices persist at once: a model download outlives this step.
  const patch = (value: Partial<api.Settings>) => {
    if (!settings) return;
    const next = { ...settings, ...value }; setSettings(next);
    if (api.native) void api.saveSettings(next).catch(e => setError(String(e)));
  };
  const local = settings?.transcriptionEngine === 'local';
  const engineReady = local ? localReady : configured || !api.native;
  const labels = [t('Privacidad', 'Privacy'), t('Motor', 'Engine'), t('Preferencias', 'Preferences'), t('Listo', 'Ready')];
  const where = isMac ? t('esta Mac', 'this Mac') : t('esta PC', 'this PC');
  const tray = isMac ? t('la barra de menús', 'the menu bar') : t('la bandeja', 'the tray');
  return <main className="setup-shell" lang={lang}>
    <header className="setup-head">
      <img src="/cristal/64x64.png" alt="" width="32" height="32" />
      <strong>Whispera</strong>
      <select aria-label="Language / Idioma" value={lang} onChange={e => setLang(e.target.value as 'es' | 'en')}><option value="es">Español</option><option value="en">English</option></select>
    </header>
    <ol className="setup-progress" aria-label={t('Progreso', 'Progress')}>
      {labels.map((label, i) => <li key={i} data-state={i < step ? 'done' : i === step ? 'current' : 'next'} aria-current={step === i ? 'step' : undefined}><i />{label}</li>)}
    </ol>
    <section key={step} className="setup-step">
      <p className="setup-eyebrow">{t(`Paso ${step + 1} de 4`, `Step ${step + 1} of 4`)}</p>
      {step === 0 && <>
        <h1>{t('Tu voz, tu configuración', 'Your voice, your setup')}</h1>
        <p>{t('Whispera transcribe tu voz y la pega donde estás escribiendo. Elegís dónde se procesa el audio:', 'Whispera transcribes your voice and pastes it where you are typing. You choose where the audio is processed:')}</p>
        <ul className="setup-facts">
          <li><Cpu size={16} strokeWidth={1.5} /><span><strong>{t('Local', 'Local')}</strong>{t(`El modelo corre en ${where}. El audio no sale de tu equipo y funciona sin internet.`, `The model runs on ${where}. Audio never leaves your computer and it works offline.`)}</span></li>
          <li><Cloud size={16} strokeWidth={1.5} /><span><strong>Groq</strong>{t('El audio y las palabras de tu diccionario van a Groq con tu propia cuenta. Sus límites y condiciones aplican.', 'Audio and your dictionary words go to Groq with your own account. Its limits and terms apply.')}</span></li>
          <li><HardDrive size={16} strokeWidth={1.5} /><span><strong>{t('En tu equipo', 'On your computer')}</strong>{t(`Grabaciones e historial quedan en ${where} para recuperarlos. La clave de Groq, si la usás, se guarda en ${credentialStore}.`, `Recordings and history stay on ${where} for recovery. A Groq key, if you use one, is stored in ${credentialStore}.`)}</span></li>
        </ul>
        <p className="setup-quiet">{t(`Sin cuenta de Whispera. Podés salir desde el icono de ${tray}.`, `No Whispera account. Quit from the icon in ${tray}.`)}</p>
      </>}
      {step === 1 && settings && <>
        <h1>{t('Elegí cómo transcribir', 'Choose how to transcribe')}</h1>
        <p>{t('Podés cambiarlo cuando quieras en Configuración › Transcripción.', 'You can change it anytime in Settings › Transcription.')}</p>
        <LocalEngine settings={settings} patch={patch} onError={setError} onReady={setLocalReady} />
        {!local && <div className="setup-groq">
          <label htmlFor="setup-key">Groq API key</label>
          <div className="setup-key-row">
            <input id="setup-key" type="password" autoComplete="off" spellCheck={false} value={key} onChange={e => setKey(e.target.value)} placeholder="gsk_..." />
            <button className="setup-secondary" disabled={busy || !key.trim() || !api.native} onClick={() => void run(async () => { await invoke('validate_key', { key }); setKey(''); setConfigured(true); })}>{configured ? t('Actualizar clave', 'Update key') : t('Validar y guardar', 'Validate and save')}</button>
          </div>
          <p className="setup-quiet">{configured ? <><Check size={14} /> {t(`Clave guardada en ${credentialStore}`, `Key saved in ${credentialStore}`)}</> : t('La comprobación consulta los modelos disponibles; no envía audio.', 'Validation checks available models; it does not send audio.')}</p>
          <GroqKeyGuide lang={lang} />
          {!api.native && <p className="setup-quiet">{t('Vista previa: las claves solo se introducen en la app instalada.', 'Preview: enter keys only in the installed app.')}</p>}
        </div>}
      </>}
      {step === 2 && settings && <>
        <h1>{t('Prepará tu primer dictado', 'Prepare your first dictation')}</h1>
        <div className="setup-device">
          <span>{t(`Micrófono de ${systemName}`, `${systemName} microphone`)}<strong>{info?.microphone ?? t('No detectado', 'Not detected')}</strong></span>
          <button className="setup-ghost" disabled={busy} onClick={() => void run(load)}>{t('Actualizar dispositivos', 'Refresh devices')}</button>
        </div>
        <p className="setup-quiet">{t(`Esto detecta el dispositivo, no la señal. Revisá el permiso de micrófono de ${systemName} y probá una frase breve al terminar.`, `This detects the device, not the signal. Check ${systemName} microphone permissions and try a short phrase after setup.`)}</p>
        {isMac && <MacPermissions lang={lang} />}
        <label htmlFor="setup-hotkey">{t('Atajo global', 'Global shortcut')}</label>
        <HotkeyInput lang={lang} id="setup-hotkey" value={settings.hotkey} onChange={hotkey => setSettings({ ...settings, hotkey })} />
        <label htmlFor="setup-language">{t('Idioma del audio', 'Audio language')}</label>
        <select id="setup-language" value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option><option value="auto">Auto</option></select>
        <label className="setup-check"><input type="checkbox" checked={settings.autoPaste} onChange={e => setSettings({ ...settings, autoPaste: e.target.checked })} />{t('Pegar al terminar en la ventana original', 'Paste into the original window when finished')}</label>
        <label className="setup-check"><input type="checkbox" checked={info?.startup ?? false} onChange={e => setInfo({ complete: false, microphone: info?.microphone ?? null, startup: e.target.checked })} />{t(isMac ? 'Iniciar con macOS, oculto en la barra de menús' : 'Iniciar con Windows, oculto en bandeja', isMac ? 'Start with macOS, hidden in the menu bar' : 'Start with Windows, hidden in the tray')}</label>
      </>}
      {step === 3 && <>
        <h1>{t('Listo para dictar', 'Ready to dictate')}</h1>
        <div className="setup-ready">
          <span className="setup-on-air"><i />{local ? t('Local · en tu equipo', 'Local · on your computer') : t('Groq · en la nube', 'Groq · in the cloud')}</span>
          <Keycaps hotkey={settings?.hotkey ?? ''} />
          <p>{t('Hacé clic en un campo de texto, pulsá el atajo y hablá. Pulsalo otra vez para transcribir y pegar.', 'Click a text field, press the shortcut and speak. Press it again to transcribe and paste.')}</p>
        </div>
        <p className="setup-quiet">{t(`La carpeta aparece mientras grabás; desde sus controles pausás o cancelás. Configuración queda en ${tray}. El texto también se guarda en Historial.`, `The folder appears while recording; its controls pause or cancel. Settings stay in ${tray}. Text is also kept in History.`)}</p>
      </>}
    </section>
    {error && <p role="alert" className="setup-error">{error}</p>}
    <footer className="setup-foot">
      <button className="setup-ghost" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}><ArrowLeft size={16} />{t('Atrás', 'Back')}</button>
      {step === 1 && !engineReady && <span className="setup-quiet">{local ? t('Instalá un modelo para seguir', 'Install a model to continue') : t('Guardá una clave para seguir', 'Save a key to continue')}</span>}
      <button className="setup-primary" disabled={busy || (step === 1 && !engineReady) || (step === 2 && !settings)} onClick={() => void run(async () => {
        if (step === 2 && settings && api.native) { await api.saveSettings(settings); await invoke('set_startup', { enabled: info?.startup ?? false }); }
        if (step < 3) setStep(step + 1);
        else { if (api.native) { await invoke('complete_setup'); await getCurrentWindow().hide(); } onDone(); }
      })}>{busy ? t('Guardando…', 'Saving…') : step === 3 ? t(isMac ? 'Ir a la barra de menús' : 'Ir a la bandeja', isMac ? 'Continue in menu bar' : 'Continue in tray') : t('Continuar', 'Continue')}<ArrowRight size={16} /></button>
    </footer>
  </main>;
}
