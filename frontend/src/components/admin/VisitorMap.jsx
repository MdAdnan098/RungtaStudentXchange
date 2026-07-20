import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import { cn } from "@/utils/cn";

const MIN_RADIUS = 8;
const MAX_RADIUS = 26;

// Centered on India with a zoom that shows the whole country — this
// project's visitors are overwhelmingly domestic, and the map still
// pans/zooms freely to anywhere bubbles happen to fall.
const INDIA_CENTER = [22.9734, 78.6569];
const DEFAULT_ZOOM = 5;

// Zoom thresholds that decide which admin level is shown as each
// bubble's on-map label — the same way a real map's place names
// change as you zoom in: country/state names zoomed out, district
// names zoomed in, neighbourhood/area names zoomed in further.
const STATE_ZOOM_MAX = 6;
const DISTRICT_ZOOM_MAX = 9;

const labelForZoom = (bubble, zoom) => {
  if (zoom <= STATE_ZOOM_MAX) return bubble.state;
  if (zoom <= DISTRICT_ZOOM_MAX) return bubble.district || bubble.city || bubble.state;
  return bubble.area || bubble.city || bubble.district || bubble.state;
};

// Sits inside <MapContainer> purely to read the live zoom level via
// react-leaflet's event hook and lift it into component state —
// MapContainer itself doesn't expose zoom as a prop-driven value.
const ZoomWatcher = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (event) => onZoomChange(event.target.getZoom()),
  });
  return null;
};

/**
 * Real map tiles (OpenStreetMap, via Leaflet — free, no API key
 * needed) so the admin always sees an actual map of India/the world,
 * not an empty grid, whether or not any visitor bubbles exist yet.
 * Each bubble is a CircleMarker sized by visitor count, with a
 * permanent label that swaps between state / district / area as the
 * admin zooms in — see labelForZoom above — and a Popup with the
 * full breakdown on click.
 */
const VisitorMap = ({ bubbles }) => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedBubble, setSelectedBubble] = useState(null);

  const maxCount = useMemo(() => Math.max(1, ...bubbles.map((b) => b.totalVisitors)), [bubbles]);

  const radiusFor = (count) => {
    const ratio = count / maxCount;
    return MIN_RADIUS + ratio * (MAX_RADIUS - MIN_RADIUS);
  };

  return (
    <div>
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border">
        <MapContainer
          center={INDIA_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          aria-label="Visitor map — bubble size reflects visitor count, labels show state, district, or area depending on zoom"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomWatcher onZoomChange={setZoom} />

          {bubbles.map((bubble) => {
            const label = labelForZoom(bubble, zoom);
            const isSelected = selectedBubble?.city === bubble.city && selectedBubble?.state === bubble.state;

            return (
              <CircleMarker
                key={`${bubble.area}-${bubble.city}-${bubble.state}-${bubble.country}`}
                center={[bubble.latitude, bubble.longitude]}
                radius={radiusFor(bubble.totalVisitors)}
                pathOptions={{
                  color: isSelected ? "#3730A3" : "#4F46E5",
                  weight: isSelected ? 3 : 1.5,
                  fillColor: "#4F46E5",
                  fillOpacity: 0.35,
                }}
                eventHandlers={{ click: () => setSelectedBubble(bubble) }}
              >
                {label && (
                  <Tooltip permanent direction="top" offset={[0, -4]} className="!text-caption !font-medium">
                    {label}
                  </Tooltip>
                )}
                <Popup>
                  <p className="font-semibold">
                    {bubble.area ? `${bubble.area}, ` : ""}
                    {bubble.city}, {bubble.state}
                  </p>
                  {bubble.district && <p className="text-xs text-gray-600">District: {bubble.district}</p>}
                  <p className="text-xs text-gray-600">{bubble.country}</p>
                  <p className="mt-1 text-sm">{bubble.totalVisitors} total visitor(s)</p>
                  <p className="text-xs text-gray-600">Today: {bubble.todaysVisitors}</p>
                  <p className="text-xs text-gray-600">This week: {bubble.thisWeeksVisitors}</p>
                  <p className="text-xs text-gray-600">This month: {bubble.thisMonthsVisitors}</p>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {bubbles.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-caption text-text-muted shadow-md">
              No location data yet — bubbles will appear here once visitors allow location access.
            </span>
          </div>
        )}
      </div>

      {selectedBubble && (
        <div className={cn("mt-4 grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-5")}>
          <div>
            <p className="text-caption text-text-muted">Location</p>
            <p className="text-body-sm font-medium text-text">
              {selectedBubble.area ? `${selectedBubble.area}, ` : ""}
              {selectedBubble.city}, {selectedBubble.state}
            </p>
            <p className="text-caption text-text-muted">
              {selectedBubble.district ? `${selectedBubble.district} · ` : ""}
              {selectedBubble.country}
            </p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Total Visitors</p>
            <p className="text-body-sm font-medium text-text">{selectedBubble.totalVisitors}</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">Today</p>
            <p className="text-body-sm font-medium text-text">{selectedBubble.todaysVisitors}</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">This Week</p>
            <p className="text-body-sm font-medium text-text">{selectedBubble.thisWeeksVisitors}</p>
          </div>
          <div>
            <p className="text-caption text-text-muted">This Month</p>
            <p className="text-body-sm font-medium text-text">{selectedBubble.thisMonthsVisitors}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorMap;
