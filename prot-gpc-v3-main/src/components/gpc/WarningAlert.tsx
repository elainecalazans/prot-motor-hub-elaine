import { CircleAlert } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

export function WarningAlert({ title, description }: Props) {
  return (
    <div className="flex items-start gap-3 overflow-hidden rounded-lg border border-border bg-[#fefce8] px-4 py-3">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#854d0e]" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium leading-5 text-[#854d0e]">{title}</p>
        <p className="text-sm font-normal leading-5 text-[#737373]">{description}</p>
      </div>
    </div>
  );
}
