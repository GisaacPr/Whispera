import type {Settings} from './client';

// Every dictation folder model, in picker order. To add a folder: add it here, to
// `Settings["dictationArtwork"]` (client.ts) and to `ARTWORKS` (storage.rs), then render it in
// FloatingRecorder and the Appearance preview. Its colour is stored in `artworkColors[id]` unless
// the model needs its own field; an empty value means the model's original look.
export type ArtworkId = NonNullable<Settings['dictationArtwork']>;
export type ArtworkModel = {
  id: ArtworkId;
  name: string;
  /** What the colour changes, shown under "Color de carpeta". */
  colorHint: string;
  /** Colour shown in the picker; `fallback` when the model keeps its original look. */
  color: (settings: Settings) => string;
  patchColor: (settings: Settings, hex: string) => Partial<Settings>;
  /** Present when the model has an original look the user can return to. */
  restore?: {label: string; active: (settings: Settings) => boolean; patch: (settings: Settings) => Partial<Settings>};
  /** Whether the "Movimiento de los papeles" pattern applies. */
  pattern: boolean;
};

/** Colour of a model stored in the shared map ('' when it keeps its original look). */
export const artworkColor = (settings: Settings, id: ArtworkId) => settings.artworkColors?.[id] ?? '';
const withArtworkColor = (settings: Settings, id: ArtworkId, hex: string): Partial<Settings> => {
  const artworkColors = {...settings.artworkColors};
  if (hex) artworkColors[id] = hex; else delete artworkColors[id];
  return {artworkColors};
};

export const artworkModels: readonly ArtworkModel[] = [
  {
    id: 'original', name: 'Carpeta animada original', colorHint: 'Superficie, bordes e iconos', pattern: true,
    color: settings => settings.color,
    patchColor: (_, hex) => ({color: hex}),
  },
  {
    id: 'metallic', name: 'Carpeta metálica', colorHint: 'Tinte metálico · conserva sombras y reflejos', pattern: false,
    color: settings => settings.metallicColor ?? '#ffffff',
    patchColor: (_, hex) => ({metallicColor: hex, metallicOriginal: false}),
    restore: {label: 'Restaurar color original', active: () => true, patch: () => ({metallicColor: '#ffffff', metallicOriginal: true})},
  },
  {
    id: 'realistic', name: 'Carpeta realista 3D', colorHint: 'Cuerpo de la carpeta · costuras y detalles combinan solos', pattern: false,
    color: settings => artworkColor(settings, 'realistic') || '#0F0F13',
    patchColor: (settings, hex) => withArtworkColor(settings, 'realistic', hex),
    restore: {label: 'Restaurar obsidiana y oro', active: settings => !!artworkColor(settings, 'realistic'), patch: settings => withArtworkColor(settings, 'realistic', '')},
  },
];

export const artworkModel = (id?: string) => artworkModels.find(model => model.id === id) ?? artworkModels[0];
