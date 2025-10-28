export function savePerformance(paper, series, score, total) {
  const key = "apex_performance";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");

  existing.push({
    paper,
    series,
    score,
    total,
    date: new Date().toISOString(),
  });

  localStorage.setItem(key, JSON.stringify(existing));
}

export function getPerformance() {
  return JSON.parse(localStorage.getItem("apex_performance") || "[]");
}
