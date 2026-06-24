import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button, cn } from '@bhubai/bhub-design-system';

/**
 * Banner eventual da Página inicial: avisos não-recorrentes (certificado digital
 * a vencer, atualização cadastral). Diferente dos cards de status, os banners têm
 * LIBERDADE CRIATIVA — podem usar cores/gradientes próprios, fora da paleta
 * semântica do sistema, para chamar atenção sem virar ruído. Os CTAs são
 * ilustrativos neste protótipo (disparam um toast).
 */
type BannerTheme = 'certificado' | 'cadastral';

interface ThemeConfig {
  icon: LucideIcon;
  card: string;
  iconWrap: string;
  cta: string;
  glow: string;
}

const THEMES: Record<BannerTheme, ThemeConfig> = {
  certificado: {
    icon: ShieldCheck,
    card: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100',
    iconWrap: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm',
    cta: 'bg-amber-500 text-white hover:bg-amber-600',
    glow: 'bg-orange-300/40',
  },
  cadastral: {
    icon: UserCog,
    card: 'border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-100',
    iconWrap: 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm',
    cta: 'bg-violet-600 text-white hover:bg-violet-700',
    glow: 'bg-indigo-300/40',
  },
};

export function BannerEventual({
  theme,
  titulo,
  descricao,
  ctaLabel,
}: {
  theme: BannerTheme;
  titulo: string;
  descricao: string;
  ctaLabel: string;
}) {
  const t = THEMES[theme];
  const Icon = t.icon;

  return (
    <div className={cn('relative overflow-hidden rounded-xl border p-5', t.card)}>
      {/* Brilho decorativo (liberdade criativa do banner). */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl', t.glow)}
      />
      <div className="relative flex items-start gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            t.iconWrap
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h4 className="text-sm font-semibold leading-5 text-foreground">{titulo}</h4>
          <p className="text-sm leading-5 text-muted-foreground">{descricao}</p>
        </div>
      </div>
      <div className="relative mt-4 flex justify-end">
        <Button
          size="sm"
          className={t.cta}
          onClick={() => toast.info('Esta ação é ilustrativa neste protótipo')}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
