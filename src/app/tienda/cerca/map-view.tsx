"use client";

import { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { DEFAULT_CENTER, distKm, type TiendaMapa } from "@/lib/data/tiendas-mapa";

type UserLoc = { lat: number; lng: number; label: string } | null;

export function MapView({ stores }: { stores: TiendaMapa[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletNS.Map | null>(null);
  const [L, setL] = useState<typeof LeafletNS | null>(null);
  const [user, setUser] = useState<UserLoc>(null);
  const [addr, setAddr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<Record<string, LeafletNS.Marker>>({});
  const userMarkerRef = useRef<LeafletNS.Marker | null>(null);

  // Lazy-load leaflet (client only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Lmod = await import("leaflet");
      if (cancelled) return;
      setL(Lmod);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Init map
  useEffect(() => {
    if (!L || !mapRef.current || map) return;
    const m = L.map(mapRef.current).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      11
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(m);

    stores.forEach((t) => {
      const icon = L.divIcon({
        className: "tienda-marker",
        html: `<div style="width:30px;height:30px;background:${t.color};border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);color:#fff;font-weight:700;font-size:13px">${t.nombre[0]}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const marker = L.marker([t.lat, t.lng], { icon }).addTo(m);
      marker.bindPopup(
        `<b>${t.nombre}</b>${t.direccion}<br><span style="color:#888">${t.zona}</span><br>📦 ${t.entrega}`
      );
      markersRef.current[t.id] = marker;
    });

    m.on("click", (e: LeafletNS.LeafletMouseEvent) => {
      setLoc(e.latlng.lat, e.latlng.lng, "Punto seleccionado");
    });

    setMap(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // Set user location + recenter
  const setLoc = (lat: number, lng: number, label: string) => {
    setUser({ lat, lng, label });
    if (!L || !map) return;
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    const icon = L.divIcon({
      className: "user-marker",
      html: `<div style="width:22px;height:22px;background:#1a56db;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    userMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    userMarkerRef.current.bindPopup(`<b>📍 Tu ubicación</b>${label}`);
    // Fit map to user + closest store
    const ordered = [...stores]
      .map((t) => ({ t, d: distKm({ lat, lng }, { lat: t.lat, lng: t.lng }) }))
      .sort((a, b) => a.d - b.d);
    if (ordered.length) {
      const bounds = L.latLngBounds([
        [lat, lng],
        [ordered[0].t.lat, ordered[0].t.lng],
      ]).pad(0.3);
      map.fitBounds(bounds);
    } else {
      map.setView([lat, lng], 13);
    }
  };

  const buscar = async () => {
    setError(null);
    if (!addr.trim()) return;
    const q = addr.toLowerCase().includes("argentina")
      ? addr
      : `${addr}, Buenos Aires, Argentina`;
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
      );
      const data = (await r.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data.length) {
        setError("No se encontró la dirección. Probá con más detalle.");
        return;
      }
      const result = data[0];
      setLoc(
        parseFloat(result.lat),
        parseFloat(result.lon),
        result.display_name.split(",").slice(0, 3).join(",")
      );
    } catch (e) {
      setError("Error al buscar: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const usarGPS = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc(pos.coords.latitude, pos.coords.longitude, "Tu ubicación actual (GPS)");
      },
      (err) => {
        setError("No se pudo obtener tu ubicación: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const ordered = user
    ? [...stores]
        .map((t) => ({ ...t, dist: distKm(user, t) }))
        .sort((a, b) => a.dist - b.dist)
    : stores.map((t) => ({ ...t, dist: null as number | null }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div
        ref={mapRef}
        className="w-full h-[520px] rounded-xl border bg-muted"
      />
      <div className="space-y-3">
        <div className="bg-card border rounded-xl p-4 space-y-2">
          <h3 className="text-[13px] font-bold flex items-center gap-1.5">
            🏠 Tu ubicación
          </h3>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              placeholder="Av. Corrientes 1234, CABA"
              className="flex-1 h-8 px-2.5 text-[13px] border rounded-md bg-background"
            />
            <button
              type="button"
              onClick={buscar}
              className="h-8 px-3 text-xs font-semibold rounded-md bg-foreground text-background"
            >
              Buscar
            </button>
          </div>
          <button
            type="button"
            onClick={usarGPS}
            className="w-full h-8 text-xs font-semibold rounded-md border bg-card hover:bg-muted"
          >
            📡 Usar mi ubicación actual
          </button>
          {error && (
            <p className="text-[11px] text-[var(--destructive)]">{error}</p>
          )}
          <div className="text-xs px-2.5 py-2 rounded-md bg-muted text-foreground/80 leading-relaxed">
            {user ? (
              <>
                <strong>{user.label}</strong>
                <br />
                Coordenadas: {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
              </>
            ) : (
              <em className="text-muted-foreground">
                Aún no configuraste una ubicación
              </em>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <h3 className="text-[13px] font-bold mb-2">
            🥬 Verdulerías disponibles
          </h3>
          <ul className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
            {ordered.map((t, i) => {
              const distStr =
                t.dist == null
                  ? null
                  : t.dist < 1
                    ? `${Math.round(t.dist * 1000)} m`
                    : `${t.dist.toFixed(1)} km`;
              const tiempo = t.dist != null ? Math.round(t.dist * 4 + 15) : null;
              return (
                <li
                  key={t.id}
                  className={`p-2.5 border rounded-md cursor-pointer transition relative ${
                    i === 0 && user
                      ? "border-[var(--success)] bg-[var(--success-bg)]/30"
                      : "hover:border-foreground hover:bg-muted"
                  }`}
                  onClick={() => {
                    const mk = markersRef.current[t.id];
                    if (mk && map) {
                      map.setView([t.lat, t.lng], 14);
                      mk.openPopup();
                    }
                  }}
                >
                  {i === 0 && user && (
                    <div
                      className="absolute -top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: "var(--success)" }}
                    >
                      ⭐ MÁS CERCA
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="size-3 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="text-[13px] font-bold flex-1">
                      {t.nombre}
                    </span>
                    {distStr && (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full text-[var(--success)]"
                        style={{ background: "var(--success-bg)" }}
                      >
                        {distStr}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t.direccion}
                  </p>
                  <div className="text-[11px] text-foreground/70 mt-1">
                    {tiempo != null && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-muted mr-1">
                        ⏱ ~{tiempo} min
                      </span>
                    )}
                    <span className="inline-block px-1.5 py-0.5 rounded bg-muted">
                      📦 {t.entrega}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
