"use client";

type HeatmapDay = { date: string; count: number };

const LEVELS = [
  "bg-[#161b22]",
  "bg-[#0e4429]",
  "bg-[#006d32]",
  "bg-[#26a641]",
  "bg-[#39d353]",
];

function getLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export default function CommitHeatmap({ data }: { data: HeatmapDay[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity data available.</p>;
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  const firstDate = new Date(data[0].date);
  const startDow = firstDate.getDay();
  const padded: (HeatmapDay | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...data,
  ];

  const weeks: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-0.5 pr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="flex h-[13px] items-center text-[10px] text-muted-foreground">
              {i % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}` : ""}
                className={`h-[13px] w-[13px] rounded-sm ${
                  day ? LEVELS[getLevel(day.count, maxCount)] : "bg-transparent"
                }`}
              />
            ))}
            {week.length < 7 &&
              Array.from({ length: 7 - week.length }, (_, i) => (
                <div key={`pad-${i}`} className="h-[13px] w-[13px]" />
              ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {LEVELS.map((cls, i) => (
          <div key={i} className={`h-[11px] w-[11px] rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
