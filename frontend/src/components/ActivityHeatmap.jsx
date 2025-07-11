import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { FaFireAlt } from 'react-icons/fa';

function getMonthLabels(startDate, endDate) {
  const months = [];
  let d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  while (d <= endDate) {
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      left: Math.floor((d - startDate) / (1000 * 60 * 60 * 24 * 7)) * 28 // estimate px left
    });
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function getStats(values, startDate, endDate) {
  let total = 0, activeDays = 0, maxStreak = 0, currentStreak = 0, prevActive = false;
  let streak = 0;
  let date = new Date(startDate);
  const valueMap = Object.fromEntries(values.map(v => [v.date, v.count]));
  while (date <= endDate) {
    const dateStr = date.toISOString().slice(0, 10);
    const count = valueMap[dateStr] || 0;
    total += count;
    if (count > 0) {
      activeDays++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
    date.setDate(date.getDate() + 1);
  }
  return { total, activeDays, maxStreak };
}

const ActivityHeatmap = () => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/activity-heatmap-year', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
    })
      .then(res => res.json())
      .then(data => {
        const mapped = Object.entries(data).map(([date, count]) => ({
          date,
          count
        }));
        setValues(mapped);
        setLoading(false);
      });
  }, []);

  // Calculate July to December (6 months)
  const today = new Date();
  let startYear, endYear;
  if (today.getMonth() + 1 >= 7) {
    // If July or later, show July-Dec of this year
    startYear = today.getFullYear();
    endYear = today.getFullYear();
  } else {
    // If before July, show July-Dec of last year
    startYear = today.getFullYear() - 1;
    endYear = today.getFullYear() - 1;
  }
  const startDate = new Date(startYear, 6, 1); // July is month 6 (0-indexed)
  const endDate = new Date(endYear, 11, 31);   // December is month 11 (0-indexed)

  const stats = getStats(values, startDate, endDate);
  const months = getMonthLabels(startDate, endDate);

  return (
    <div className="max-w-3xl mx-auto my-8 p-8 rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-100 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl text-green-500 drop-shadow"><FaFireAlt /></span>
          <span className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</span>
          <span className="text-gray-700 ml-1">submissions from July to December</span>
        </div>
        <div className="flex gap-6 text-sm md:text-base text-blue-700 font-medium">
          <span>Total active days: <span className="text-green-600 font-bold">{stats.activeDays}</span></span>
          <span>Max streak: <span className="text-green-600 font-bold">{stats.maxStreak}</span></span>
        </div>
      </div>
      <div className="flex justify-center">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={value => {
            if (!value || value.count === 0) return 'color-empty';
            if (value.count >= 5) return 'color-github-4';
            if (value.count >= 3) return 'color-github-3';
            if (value.count >= 2) return 'color-github-2';
            return 'color-github-1';
          }}
          tooltipDataAttrs={value =>
            value && value.date
              ? { 'data-tip': `${value.date}: ${value.count} submissions` }
              : {}
          }
          showMonthLabels={true}
          showWeekdayLabels={false}
        />
        <Tooltip />
      </div>
      {/* Remove the color legend below the heatmap */}
      <style>{`
        .react-calendar-heatmap .react-calendar-heatmap-cell {
          rx: 4px;
          ry: 4px;
          width: 18px !important;
          height: 18px !important;
          stroke: #bcdffb;
          shape-rendering: geometricPrecision;
        }
        .color-empty { fill: #e0e7ef; }
        .color-github-1 { fill: #c6e48b; }
        .color-github-2 { fill: #7bc96f; }
        .color-github-3 { fill: #239a3b; }
        .color-github-4 { fill: #196127; }
        .react-calendar-heatmap text {
          fill: #888;
          font-size: 10px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap; 