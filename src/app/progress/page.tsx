const moodTrend = [3.2, 3.4, 3.1, 3.6, 3.8, 3.7, 3.9, 4.1, 3.8, 4.0, 4.2, 4.1];
const moodLabels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const activityBars = [
  { label: "Mon", posts: 4, events: 1, gratitude: 2 },
  { label: "Tue", posts: 5, events: 2, gratitude: 3 },
  { label: "Wed", posts: 3, events: 1, gratitude: 2 },
  { label: "Thu", posts: 6, events: 3, gratitude: 4 },
  { label: "Fri", posts: 7, events: 2, gratitude: 5 },
  { label: "Sat", posts: 2, events: 1, gratitude: 1 },
  { label: "Sun", posts: 3, events: 1, gratitude: 2 },
];

const history = [
  { date: "Feb 10", mood: 4.2, energy: "High", note: "Hosted reflection circle", impact: "+3 replies" },
  { date: "Feb 09", mood: 3.8, energy: "Medium", note: "Shared gratitude post", impact: "+5 reactions" },
  { date: "Feb 08", mood: 4.0, energy: "High", note: "Joined micro-event", impact: "+1 event joined" },
  { date: "Feb 07", mood: 3.6, energy: "Medium", note: "Check-in only", impact: "+0" },
  { date: "Feb 06", mood: 3.9, energy: "Medium", note: "Commented in village", impact: "+2 replies" },
  { date: "Feb 05", mood: 4.1, energy: "High", note: "Shared gratitude post", impact: "+6 reactions" },
  { date: "Feb 04", mood: 3.7, energy: "Medium", note: "Joined workshop", impact: "+1 event joined" },
  { date: "Feb 03", mood: 3.5, energy: "Low", note: "Asked for support", impact: "+4 supportive replies" },
];

function getLinePoints(values: number[]) {
  const width = 100;
  const height = 50;
  const min = 2.5;
  const max = 4.5;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function ProgressPage() {
  return (
    <section className="space-y-6 rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-6 shadow-[0_8px_20px_rgba(39,64,92,0.18)]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#355072]">Progress</p>
        <h1 className="text-3xl font-black text-[#15263d]">Trends & Impact</h1>
        <p className="max-w-2xl text-base text-[#355072]">
          Personal stats, community impact, and history in one dashboard.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#1d3048]">Mood trend (12 weeks)</p>
            <p className="text-xs text-[#4d6a8f]">Simple line graph from check-in history</p>
          </div>
          <svg viewBox="0 0 100 50" className="h-36 w-full rounded-md border border-[#a9bfdc] bg-[#f7fbff] p-2">
            <polyline
              fill="none"
              stroke="#2f5c8f"
              strokeWidth="2"
              points={getLinePoints(moodTrend)}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 grid grid-cols-6 gap-1 text-[10px] text-[#5f7fa3] sm:grid-cols-12">
            {moodLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <div className="mb-3">
            <p className="text-sm font-semibold text-[#1d3048]">Weekly activity</p>
            <p className="text-xs text-[#4d6a8f]">Posts, events joined, and gratitude shared</p>
          </div>
          <div className="grid h-44 grid-cols-7 items-end gap-2 rounded-md border border-[#a9bfdc] bg-[#f7fbff] p-3">
            {activityBars.map((item) => {
              const total = item.posts + item.events + item.gratitude;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-[#83a8d2]"
                    style={{ height: `${Math.max(12, total * 8)}px` }}
                    title={`${item.label}: ${total} actions`}
                  />
                  <span className="text-[10px] font-medium text-[#4d6a8f]">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#4d6a8f]">
            <span>Blue bar = total actions/day</span>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Personal stats</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Current streak</p>
              <p className="text-xl font-black text-[#15263d]">11 days</p>
            </div>
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Avg mood</p>
              <p className="text-xl font-black text-[#15263d]">3.9 / 5</p>
            </div>
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Check-ins</p>
              <p className="text-xl font-black text-[#15263d]">47</p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
          <p className="text-sm font-semibold text-[#1d3048]">Community impact</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Total posts</p>
              <p className="text-xl font-black text-[#15263d]">63</p>
            </div>
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Events joined</p>
              <p className="text-xl font-black text-[#15263d]">19</p>
            </div>
            <div className="rounded-lg border border-[#9eb6d7] bg-[#f7fbff] p-3">
              <p className="text-xs text-[#4d6a8f]">Gratitude shared</p>
              <p className="text-xl font-black text-[#15263d]">28</p>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-xl border border-[#49658a] bg-[#edf3fb] p-5 shadow-[0_2px_0_#8da7c6]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1d3048]">Check-in history</p>
          <p className="text-xs text-[#4d6a8f]">Scrollable recent activity</p>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-[#9eb6d7] bg-[#f7fbff]">
          {history.map((item) => (
            <div
              key={`${item.date}-${item.note}`}
              className="grid grid-cols-[90px_90px_1fr_140px] gap-3 border-b border-[#d6e4f5] px-3 py-2 text-sm last:border-b-0"
            >
              <p className="font-semibold text-[#1d3048]">{item.date}</p>
              <p className="text-[#355072]">
                Mood {item.mood} <span className="text-[#5f7fa3]">({item.energy})</span>
              </p>
              <p className="text-[#355072]">{item.note}</p>
              <p className="text-right text-[#4d6a8f]">{item.impact}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
