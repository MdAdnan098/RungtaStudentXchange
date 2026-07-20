// Small regex-based parser for the handful of fields Visitor
// Analytics needs (browser name, OS name, device type). Deliberately
// not a full UA-parsing library (ua-parser-js etc.) — pulling in a
// new dependency for three fields on one background call isn't worth
// it, and this only has to be "good enough for an admin table", not
// perfectly precise.
export const parseUserAgent = (userAgent = navigator.userAgent) => {
  const ua = userAgent || "";

  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/CriOS/.test(ua)) browser = "Chrome (iOS)";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/FxiOS/.test(ua)) browser = "Firefox (iOS)";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";
  else if (/MSIE|Trident\//.test(ua)) browser = "Internet Explorer";

  let operatingSystem = "Unknown";
  if (/Windows NT/.test(ua)) operatingSystem = "Windows";
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad|iPod/.test(ua)) operatingSystem = "macOS";
  else if (/Android/.test(ua)) operatingSystem = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) operatingSystem = "iOS";
  else if (/Linux/.test(ua)) operatingSystem = "Linux";

  let deviceType = "Desktop";
  if (/iPad/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) deviceType = "Tablet";
  else if (/Mobile|iPhone|Android/.test(ua)) deviceType = "Mobile";

  return { browser, operatingSystem, deviceType };
};
