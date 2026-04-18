import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Report, Organization } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Plus, Minus, Navigation2, Stethoscope, Home, ShieldCheck, Heart } from "lucide-react";

interface MapComponentProps {
  reports: Report[];
  organizations?: Organization[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (report: Report) => void;
  onOrgClick?: (org: Organization) => void;
  center?: [number, number];
  focusLocation?: [number, number] | null;
}

// Build the "YOU" marker icon HTML once so it never re-renders
function buildUserIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Outer pulsing ring -->
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(248,148,123,0.25);
          animation: youPing 1.8s ease-out infinite;
        "></div>
        <!-- Middle ring -->
        <div style="
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: rgba(248,148,123,0.35);
          animation: youPing 1.8s ease-out 0.4s infinite;
        "></div>
        <!-- Core dot -->
        <div style="
          position: relative;
          z-index: 2;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f8947b;
          border: 3px solid white;
          box-shadow: 0 2px 12px rgba(248,148,123,0.7), 0 0 0 2px rgba(248,148,123,0.3);
        "></div>
      </div>
      <style>
        @keyframes youPing {
          0%   { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      </style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function MapComponentContent({
  reports,
  organizations = [],
  onMapClick,
  onMarkerClick,
  onOrgClick,
  center = [10.74, 121.94], // Centered on Antique by default now
  focusLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  // Track if the user is manually panning so we don't force-follow them
  const userPannedRef = useRef(false);
  const autoFollowRef = useRef(true);

  const [isLocating, setIsLocating] = useState(false);
  const [showLocatingOverlay, setShowLocatingOverlay] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsFailed, setGpsFailed] = useState(false);

  // ── Core GPS handler: runs on every position update ───────────────
  const handlePosition = useCallback((pos: GeolocationPosition, L: any, map: any) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const latlng = L.latLng(latitude, longitude);

    setIsLocating(false);
    setShowLocatingOverlay(false);
    setGpsFailed(false);
    setGpsAccuracy(Math.round(accuracy));

    // ── Accuracy circle ──────────────────────────────────────────────
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(latlng);
      accuracyCircleRef.current.setRadius(accuracy);
    } else {
      accuracyCircleRef.current = L.circle(latlng, {
        radius: accuracy,
        weight: 1,
        color: "#f8947b",
        fillColor: "#f8947b",
        fillOpacity: 0.08,
        dashArray: "4 4",
        interactive: false,
      }).addTo(map);
    }

    // ── YOU marker ───────────────────────────────────────────────────
    if (userMarkerRef.current) {
      // Smoothly slide marker to new position
      userMarkerRef.current.setLatLng(latlng);
    } else {
      const icon = buildUserIcon(L);
      userMarkerRef.current = L.marker(latlng, {
        icon,
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);
      // First fix: fly to user, then let them control
      map.flyTo(latlng, 17, { duration: 1.2, easeLinearity: 0.3 });
      autoFollowRef.current = true;
    }

    // Auto-follow: pan to user if they haven't manually scrolled away
    if (autoFollowRef.current && !focusLocation && !userPannedRef.current) {
      map.panTo(latlng, { animate: true, duration: 0.5 });
    }
  }, [focusLocation]);

  // ── Map initialization ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;
      if ((mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
        // Smoother panning on mobile
        inertia: true,
        inertiaDeceleration: 3000,
      }).setView(center, 14);
      leafletMapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 21, tileSize: 256 }
      ).addTo(map);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // Detect manual pan: stop auto-follow until user taps "locate" again
      map.on("dragstart", () => {
        userPannedRef.current = true;
        autoFollowRef.current = false;
      });

      // ── Start real GPS watch immediately ────────────────────────────
      if (!focusLocation && "geolocation" in navigator) {
        setShowLocatingOverlay(true);
        setIsLocating(true);

        // Safety timeout: if no fix in 15s, dismiss overlay
        const safetyTimer = setTimeout(() => {
          setShowLocatingOverlay(false);
          setIsLocating(false);
          setGpsFailed(true);
        }, 15000);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            clearTimeout(safetyTimer);
            handlePosition(pos, L, map);
          },
          (err) => {
            clearTimeout(safetyTimer);
            console.warn("GPS error:", err.code, err.message);
            setIsLocating(false);
            setShowLocatingOverlay(false);
            setGpsFailed(true);
          },
          {
            enableHighAccuracy: true,   // Use GPS chip, not just network
            maximumAge: 0,              // Never use cached positions
            timeout: 12000,             // Give hardware 12s to respond
          }
        );
      }
    });

    return () => {
      // Stop the GPS watcher when leaving the page
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (leafletMapRef.current) {
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
        accuracyCircleRef.current?.remove();
        accuracyCircleRef.current = null;
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);  // eslint-disable-line

  // ── Focus on a selected report ─────────────────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || !focusLocation) return;
    // When viewing a report, pause auto-follow temporarily
    autoFollowRef.current = false;
    leafletMapRef.current.flyTo(focusLocation, 18, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [focusLocation]);

  // ── All markers (Reports + Organizations) ─────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current) return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 1. Render Reports
      reports.forEach((report, index) => {
        const isRescued = report.status === "rescued";
        const isLost = report.category === "lost";
        
        // Dynamic colors: Lost = Blue, Rescued = Green, Stray = Orange
        const color = isRescued ? "#10b981" : isLost ? "#3b82f6" : "#f8947b";

        const photoHtml = report.imageUrl
          ? `<img src="${report.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`
          : `<span style="font-size:18px;">${report.animalType === "dog" ? "🐶" : report.animalType === "cat" ? "🐱" : "🐾"}</span>`;

        const icon = L.divIcon({
          className: "",
          html: `
            <style>
              @keyframes mpIn { 0%{transform:scale(0) translateY(10px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
              @keyframes mpPulse { 0%,100%{box-shadow:0 0 0 0 ${color}55} 50%{box-shadow:0 0 0 10px ${color}00} }
            </style>
            <div style="
              position:relative;width:52px;height:60px;
              animation:mpIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) ${Math.min(index*0.02, 0.4)}s both;
              filter:drop-shadow(0 6px 12px rgba(0,0,0,0.18));
            ">
              <div style="
                width:52px;height:52px;
                background:white;
                border:3px solid white;
                box-shadow:inset 0 0 0 2px ${color};
                border-radius:16px;overflow:hidden;
                display:flex;align-items:center;justify-content:center;
                ${!isRescued ? `animation:mpPulse 2s infinite ease-in-out;` : ''}
              ">
                ${photoHtml}
              </div>
              <div style="
                position:absolute;top:-4px;right:-4px;
                width:18px;height:18px;
                background:white;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                box-shadow:0 1px 4px rgba(0,0,0,0.12);
                font-size:9px;
              ">${isRescued ? '✅' : isLost ? '🔍' : '🛡️'}</div>
              <div style="
                position:absolute;bottom:-6px;left:50%;
                transform:translateX(-50%);
                width:10px;height:10px;
                background:${color};
                clip-path:polygon(50% 100%,0 0,100% 0);
              "></div>
            </div>
          `,
          iconSize: [52, 60],
          iconAnchor: [26, 60],
        });

        const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(
          leafletMapRef.current
        );
        marker.on("click", (e: any) => {
          onMarkerClick(report);
          L.DomEvent.stopPropagation(e);
        });
        markersRef.current.push(marker);
      });

      // 2. Render Organizations (Vets/Shelters)
      organizations.forEach((org) => {
        const isClinic = org.type === "clinic";
        const color = isClinic ? "#ec4899" : "#8b5cf6"; // Pink for Vets, Purple for Shelters

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:40px;height:40px;
              background:${color};
              border:3px solid white;
              border-radius:12px;
              display:flex;align-items:center;justify-content:center;
              color:white;
              box-shadow:0 4px 12px ${color}44;
              filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));
            ">
              ${isClinic ? '🏥' : '🏠'}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([org.lat, org.lng], { icon, zIndexOffset: -100 }).addTo(
          leafletMapRef.current
        );
        marker.on("click", (e: any) => {
          if (onOrgClick) onOrgClick(org);
          L.DomEvent.stopPropagation(e);
        });
        markersRef.current.push(marker);
      });
    });
  }, [reports, organizations]);

  // ── "Re-center on me" button ──────────────────────────────────────
  function handleLocate() {
    if (!("geolocation" in navigator)) return;
    setIsLocating(true);
    setGpsFailed(false);

    // Re-enable auto-follow and reset user-panned flag
    userPannedRef.current = false;
    autoFollowRef.current = true;

    // If watch is already running, just re-center
    if (watchIdRef.current !== null && userMarkerRef.current) {
      const latlng = userMarkerRef.current.getLatLng();
      leafletMapRef.current?.flyTo(latlng, 17, { duration: 1 });
      setIsLocating(false);
      return;
    }

    // Otherwise start a fresh watch
    import("leaflet").then((L) => {
      if (!leafletMapRef.current) return;
      const map = leafletMapRef.current;
      const safetyTimer = setTimeout(() => {
        setIsLocating(false);
        setGpsFailed(true);
      }, 12000);

      // Clear any previous watch first
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          clearTimeout(safetyTimer);
          handlePosition(pos, L, map);
        },
        (err) => {
          clearTimeout(safetyTimer);
          console.warn("GPS error:", err.message);
          setIsLocating(false);
          setGpsFailed(true);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    });
  }

  // Accuracy label
  const accuracyLabel = gpsAccuracy === null
    ? null
    : gpsAccuracy <= 5 ? "Precise"
    : gpsAccuracy <= 15 ? "Good"
    : gpsAccuracy <= 40 ? "Fair"
    : "Weak";

  const accuracyColor = gpsAccuracy === null
    ? ""
    : gpsAccuracy <= 15 ? "text-emerald-600 bg-emerald-50"
    : gpsAccuracy <= 40 ? "text-orange-500 bg-orange-50"
    : "text-red-500 bg-red-50";

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* ── Locating Overlay ── */}
      <AnimatePresence>
        {showLocatingOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none"
          >
            <div className="glass px-7 py-4 rounded-[2rem] border-white shadow-2xl flex flex-col items-center gap-3 text-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full bg-[hsl(15,80%,65%)]/20 animate-ping" />
                <div className="relative w-12 h-12 rounded-2xl bg-[hsl(15,80%,65%)] flex items-center justify-center shadow-lg">
                  <Navigation2 size={22} className="text-white animate-pulse" />
                </div>
              </div>
              <div>
                <p className="font-black text-[hsl(160,10%,20%)] text-sm">Locking GPS Signal</p>
                <p className="text-[9px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest mt-0.5">
                  Stand still for best accuracy
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GPS Failed Toast ── */}
      <AnimatePresence>
        {gpsFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
          >
            <div className="bg-red-50 border border-red-100 px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                GPS Unavailable — Enable location access
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accuracy Badge (top-left, below map overlay) ── */}
      <AnimatePresence>
        {gpsAccuracy !== null && !showLocatingOverlay && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute bottom-[5.5rem] left-4 z-[400] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${accuracyColor}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${gpsAccuracy <= 15 ? "bg-emerald-500 animate-pulse" : gpsAccuracy <= 40 ? "bg-orange-400" : "bg-red-500"}`} />
            GPS {accuracyLabel} · ±{gpsAccuracy}m
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Locate / Re-center Button ── */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleLocate}
        disabled={isLocating}
        aria-label="Center on my location"
        className="absolute left-4 bottom-4 z-[400] w-13 h-13 glass rounded-[1.3rem] shadow-2xl flex items-center justify-center text-[hsl(160,10%,20%)] transition-all hover:text-[hsl(15,80%,65%)] disabled:opacity-50 border border-white/60"
        style={{ width: 52, height: 52 }}
      >
        <Crosshair
          size={22}
          className={isLocating ? "animate-spin text-[hsl(15,80%,65%)]" : autoFollowRef.current ? "text-[hsl(15,80%,65%)]" : ""}
        />
      </motion.button>

      {/* ── Zoom Controls ── */}
      <div className="absolute right-4 bottom-4 z-[400] flex flex-col glass rounded-[1.3rem] shadow-2xl border border-white/60 overflow-hidden">
        <button
          onClick={() => leafletMapRef.current?.zoomIn()}
          aria-label="Zoom In"
          className="w-[52px] h-[52px] flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white/40 hover:text-[hsl(15,80%,65%)] transition-all border-b border-white/20"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => leafletMapRef.current?.zoomOut()}
          aria-label="Zoom Out"
          className="w-[52px] h-[52px] flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white/40 hover:text-[hsl(15,80%,65%)] transition-all"
        >
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
}

export default memo(MapComponentContent);
