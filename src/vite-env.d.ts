/// <reference types="vite/client" />

declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  export type LucideIcon = React.FC<LucideProps>;

  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Send: LucideIcon;
  export const Square: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Cpu: LucideIcon;
  export const Cloud: LucideIcon;
  export const Wifi: LucideIcon;
  export const WifiOff: LucideIcon;
  export const Settings: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const FileText: LucideIcon;
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Compass: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Clock: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const FileEdit: LucideIcon;
  export const X: LucideIcon;
  export const Key: LucideIcon;
  export const Trash2: LucideIcon;
  export const ClipboardPaste: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const XCircle: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
