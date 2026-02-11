"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

const MOOD_ZONES = [
  {
    id: "harbor",
    name: "Harbor District",
    description: "Calm tides and steady energy.",
    mood: "Calm",
    center: [37.77, -122.42],
    radius: 26000,
    color: "#60a5fa",
  },
  {
    id: "ridge",
    name: "Sunrise Ridge",
    description: "Bright momentum and hope.",
    mood: "Hopeful",
    center: [34.05, -118.25],
    radius: 34000,
    color: "#fbbf24",
  },
  {
    id: "midtown",
    name: "Midtown Loop",
    description: "Neutral skies with steady movement.",
    mood: "Balanced",
    center: [41.88, -87.62],
    radius: 30000,
    color: "#94a3b8",
  },
  {
    id: "stormline",
    name: "Stormline",
    description: "Emotional storms moving through.",
    mood: "Storm",
    center: [40.71, -74.0],
    radius: 42000,
    color: "#f87171",
  },
];

const SHELTERS = [
  {
    id: "shelter-north",
    name: "North Shelter",
    center: [47.61, -122.33],
  },
  {
    id: "shelter-central",
    name: "Central Shelter",
    center: [39.95, -75.17],
  },
  {
    id: "shelter-south",
    name: "South Shelter",
    center: [29.76, -95.36],
  },
];

const SUNSHINE = [
  {
    id: "sun-1",
    label: "Sunshine moment",
    center: [36.16, -115.15],
  },
  {
    id: "sun-2",
    label: "Sunshine moment",
    center: [33.45, -112.07],
  },
];

const createLanternIcon = (L: typeof import("leaflet")) => {
  return L.divIcon({
    className: "mood-marker",
    html: `<img src="/map/lantern.svg" alt="Lantern mood" />`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -34],
  });
};

export default function MapPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const mapInitRef = useRef(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMood, setLogMood] = useState("Calm");
  const [logComment, setLogComment] = useState("");
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    document.body.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || mapInitRef.current) return;

    mapInitRef.current = true;
    let cancelled = false;

    const initMap = async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;
      const L = leaflet as typeof import("leaflet");
      leafletRef.current = L;

      const map = L.map(mapContainerRef.current as HTMLDivElement, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 16,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      }).addTo(map);

      map.setView([1.3521, 103.8198], 12);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft" }).addTo(map);

      MOOD_ZONES.forEach((zone) => {
        L.circle(zone.center as L.LatLngExpression, {
          radius: zone.radius,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.35,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${zone.name}</strong><br/>${zone.mood} weather<br/>${zone.description}`
          );
      });

      SHELTERS.forEach((shelter) => {
        L.circleMarker(shelter.center as L.LatLngExpression, {
          radius: 8,
          color: "#0f172a",
          fillColor: "#38bdf8",
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(`<strong>${shelter.name}</strong><br/>Weather shelter`);
      });

      SUNSHINE.forEach((spot) => {
        L.circleMarker(spot.center as L.LatLngExpression, {
          radius: 6,
          color: "#f59e0b",
          fillColor: "#fde047",
          fillOpacity: 0.95,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(`<strong>${spot.label}</strong><br/>Community uplift`);
      });

      map.on("click", (event: L.LeafletMouseEvent) => {
        setClickedLatLng({ lat: event.latlng.lat, lng: event.latlng.lng });
        setShowLogModal(true);
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      cancelled = true;
      mapInitRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <section className="relative h-screen w-screen">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0"
        aria-label="Community mood map"
      />

      <div className="pointer-events-none absolute left-4 bottom-4 right-4 z-40 flex flex-col gap-3 sm:left-6 sm:bottom-6 md:right-auto md:max-w-[260px]">
        <div className="pointer-events-auto rounded-xl border border-[#49658a] bg-[#edf3fb] p-4 shadow-[0_2px_0_#8da7c6]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d6a8f]">
            Live community weather
          </p>
          <h1 className="mt-2 text-2xl font-black text-[#15263d]">Mood Map</h1>
          <p className="mt-2 text-sm text-[#355072]">
            See where neighbors share similar weather patterns, join shelters during storms, and
            add sunshine moments that lift the collective mood.
          </p>
        </div>

        <div className="pointer-events-auto grid gap-3 rounded-xl border border-[#49658a] bg-[#edf3fb] p-4 text-sm text-[#355072] shadow-[0_2px_0_#8da7c6]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1d3048]">Weather shelters</span>
            <span className="rounded-full bg-[#d7e7fb] px-2 py-1 text-xs font-semibold text-[#2f5c8f]">
              Join
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1d3048]">Sunshine moments</span>
            <span className="rounded-full bg-[#d7e7fb] px-2 py-1 text-xs font-semibold text-[#2f5c8f]">
              Share
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1d3048]">Weather patterns</span>
            <span className="rounded-full bg-[#d7e7fb] px-2 py-1 text-xs font-semibold text-[#2f5c8f]">
              Explore
            </span>
          </div>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Log your mood here</h2>
            <p className="mt-1 text-sm text-slate-600">
              Add a quick mood and note for this location.
            </p>

            <div className="mt-4 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Mood
                <select
                  value={logMood}
                  onChange={(event) => setLogMood(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option>Calm</option>
                  <option>Hopeful</option>
                  <option>Balanced</option>
                  <option>Stormy</option>
                  <option>Grateful</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Comment
                <textarea
                  value={logComment}
                  onChange={(event) => setLogComment(event.target.value)}
                  className="mt-2 min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Share what you are feeling..."
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setShowLogModal(false);
                  setLogComment("");
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => {
                  if (!clickedLatLng || !mapRef.current) return;
                  const L = leafletRef.current;
                  if (!L) return;
                  const icon = createLanternIcon(L);
                  L.marker([clickedLatLng.lat, clickedLatLng.lng], { icon })
                    .addTo(mapRef.current)
                    .bindPopup(
                      `<strong>${logMood}</strong><br/>${logComment || "Mood logged"}`
                    )
                    .openPopup();

                  setShowLogModal(false);
                  setLogComment("");
                }}
              >
                Save mood
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .mood-marker {
          background: transparent;
          border: none;
        }

        .mood-marker img {
          display: block;
          width: 32px;
          height: 32px;
        }
      `}</style>
    </section>
  );
}
