import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bhubai/bhub-design-system';

export function TaskIconTooltip({
  content,
  children,
}: {
  content?: string;
  children: React.ReactElement;
}) {
  if (!content) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="gpc-status-tooltip">
        <span className="block w-fit max-w-64 text-wrap">{content}</span>
      </TooltipContent>
    </Tooltip>
  );
}
