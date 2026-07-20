// Builds and downloads a CSV from already-fetched visitor records —
// no new dependency (papaparse etc.) needed for a fixed, known set of
// columns this small. Called with the *unpaginated* filtered list
// from GET /admin/visitors/export (see api/admin.js exportVisitors),
// so "Export CSV" always exports every currently-filtered record, not
// just the current page.
const HEADERS = [
  "Date",
  "Time",
  "City",
  "State",
  "Country",
  "Latitude",
  "Longitude",
  "Browser",
  "Operating System",
  "Device",
  "Logged-in / Guest",
  "Permission Status",
];

const escapeCsvField = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toRow = (visitor) => {
  const createdAt = new Date(visitor.createdAt);

  return [
    createdAt.toLocaleDateString("en-IN"),
    createdAt.toLocaleTimeString("en-IN"),
    visitor.city || "",
    visitor.state || "",
    visitor.country || "",
    visitor.latitude ?? "",
    visitor.longitude ?? "",
    visitor.browser || "",
    visitor.operatingSystem || "",
    visitor.deviceType || "",
    visitor.isGuest ? "Guest" : visitor.user?.name || "Logged-in",
    visitor.permissionStatus || "",
  ];
};

export const exportVisitorsCsv = (visitors, filename = "visitor-analytics.csv") => {
  const rows = [HEADERS, ...visitors.map(toRow)];
  const csvContent = rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
