export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "green" | "red";
}) {
  const toneClasses = {
    neutral: "bg-stone-100 text-stone-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "free" | "member" }) {
  return <Badge tone={tier === "member" ? "amber" : "green"}>{tier === "member" ? "member" : "free"}</Badge>;
}
