export const exportToCSV = (data, filename = "data") => {
  const csvRows = [];

  const headers = Object.keys(data[0] || {}).join(",");
  csvRows.push(headers);

  for (const row of data) {
    const values = Object.values(row).map((val) =>
      typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
    );
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data, filename = "data") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
