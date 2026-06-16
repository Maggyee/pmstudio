import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-normal text-neutral-950 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-7 text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}
