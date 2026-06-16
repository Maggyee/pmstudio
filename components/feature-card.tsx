import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { featureCards } from "@/lib/mock-data";

type Feature = (typeof featureCards)[number];

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <Card className="group h-full overflow-hidden liquid-card-interactive">
      <CardHeader>
        <div
          className={cn(
            "mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition duration-300 group-hover:scale-105 group-hover:bg-white/70",
            feature.accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle>{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-neutral-600">{feature.description}</p>
      </CardContent>
    </Card>
  );
}
