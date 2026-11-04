/**
 * El `Icon` de Syka Legacy (por nombre) con los íconos de lucide (Whispera),
 * para que «Novedades» se copie de Kevin sin tocar sus dibujos.
 */
import type { JSX, SVGProps } from 'react'
import {
  ArrowRight,
  ArrowUp,
  AudioLines,
  Cloud,
  Cpu,
  Frame,
  ScanLine,
  Video,
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleX,
  Clock,
  Folder,
  GripVertical,
  Laptop,
  List,
  ListTodo,
  MessageCirclePlus,
  MessageSquareShare,
  Mic,
  Plug,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Terminal,
  UserCheck,
  X,
  type LucideIcon
} from 'lucide-react'

const ICONS: Readonly<Record<string, LucideIcon>> = {
  AudioLines,
  Cloud,
  Cpu,
  Frame,
  ScanLine,
  Video,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleX,
  Clock,
  Folder,
  GripVertical,
  Laptop,
  ListTodo,
  ListView: List,
  MessageCirclePlus,
  Mic,
  Plug02: Plug,
  Plus,
  RefreshCw,
  Repeat,
  SecurityCheck: ShieldCheck,
  SideChat: MessageSquareShare,
  Terminal,
  UserCheck,
  X
}

export function Icon({ name, ...rest }: { name: string } & SVGProps<SVGSVGElement> & { 'aria-hidden'?: boolean | 'true' | 'false' }): JSX.Element | null {
  const Glyph = ICONS[name]
  return Glyph === undefined ? null : <Glyph {...(rest as Record<string, unknown>)} />
}
