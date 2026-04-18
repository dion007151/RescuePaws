import { useEffect, useRef, useState, memo } from "react";
import { Report } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Plus, Minus, MapPin } from "lucide-react";

interface MapComponentProps {
  reports: Report[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (report: Report) => void;
  center?: [number, number];
  focusLocation?: [number, number] | null;
}

function MapComponentContent({
  reports,
  onMapClick,
  onMarkerClick,
  center = [14.5995, 120.9842],
  focusLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocatingOverlay, setShowLocatingOverlay] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;
      
      if ((mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, 13);
      leafletMapRef.current = map;

      // High-performance tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 20,
      }).addTo(map);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // AUTO-LOCATION: Find the user immediately on load if no focusLocation is provided
      if (!focusLocation) {
        setShowLocatingOverlay(true);
        map.locate({ setView: true, maxZoom: 16 });
        
        map.on("locationfound", () => {
          setShowLocatingOverlay(false);
        });
        
        map.on("locationerror", () => {
          setShowLocatingOverlay(false);
        });
        
        // Timeout to hide overlay if GPS is too slow
        setTimeout(() => setShowLocatingOverlay(false), 5000);
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !focusLocation) return;
    
    leafletMapRef.current.flyTo(focusLocation, 18, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [focusLocation]);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      reports.forEach((report, index) => {
        const isRescued = report.status === "rescued";
        const color = isRescued ? "#10b981" : "#f8947b";
        
        const photoHtml = report.imageUrl 
          ? `<img src="${report.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" />`
          : `<span style="font-size: 20px;">${report.animalType === "dog" ? "🐶" : report.animalType === "cat" ? "🐱" : "🐾"}</span>`;

        const icon = L.divIcon({
          className: "marker-pin-container",
          html: `
            <style>
              @keyframes marker-appear {
                0% { transform: scale(0) translateY(10px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              @keyframes marker-pulse {
                0% { box-shadow: 0 0 0 0 ${color}44; transform: scale(1); }
                50% { box-shadow: 0 0 0 12px ${color}00; transform: scale(1.05); }
                100% { box-shadow: 0 0 0 0 ${color}00; transform: scale(1); }
              }
              .marker-pin-wrapper {
                filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
              }
              .marker-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border: 1px solid ${color}44;
                z-index: 10;
              }
            </style>
            <div class="marker-pin-wrapper ${!isRescued ? 'active-pulse' : ''}" style="
              animation: marker-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              animation-delay: ${Math.min(index * 0.03, 0.6)}s;
              position: relative;
              width: 56px;
              height: 56px;
              ${!isRescued ? `animation: marker-pulse 2s infinite ease-in-out;` : ''}
            ">
              <div class="photo-pin" style="
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(4px);
                border: 4px solid white;
                box-shadow: inset 0 0 0 2px ${color};
                border-radius: 20px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              ">
                ${photoHtml}
              </div>
              <div class="marker-badge">
                <span style="font-size: 10px;">${isRescued ? '✅' : '🛡️'}</span>
              </div>
              <div class="pin-stem" style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 12px;
                height: 12px;
                background: ${color};
                clip-path: polygon(50% 100%, 0 0, 100% 0);
              "></div>
            </div>
          `,
          iconSize: [56, 64],
          iconAnchor: [28, 64],
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
    });
  }, [reports]);

  function handleLocate() {
    if (!leafletMapRef.current) return;
    setIsLocating(true);
    try {
      leafletMapRef.current.locate({ setView: true, maxZoom: 16 });
      leafletMapRef.current.on("locationfound", () => setIsLocating(false));
      leafletMapRef.current.on("locationerror", () => setIsLocating(false));
    } catch (err) {
      console.error("GPS Error:", err);
      setIsLocating(false);
    }
  }

  function handleZoomIn() {
    leafletMapRef.current?.zoomIn();
  }

  function handleZoomOut() {
    leafletMapRef.current?.zoomOut();
  }

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-[2.5rem] border-4 border-white shadow-inner">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Locating Overlay */}
      <AnimatePresence>
        {showLocatingOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none"
          >
            <div className="glass px-8 py-4 rounded-[2rem] border-white shadow-2xl flex flex-col items-center gap-3 text-center min-w-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(15,80%,65%)] flex items-center justify-center verified-ring">
                 <MapPin size={24} className="text-white animate-bounce" />
              </div>
              <div>
                <p className="font-black text-[hsl(160,10%,20%)] italic">Locating You...</p>
                <p className="text-[10px] text-[hsl(155,15%,50%)] font-black uppercase tracking-widest mt-1">Securing GPS Signal</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* GPS Locate Button — positioned separately, always visible */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLocate}
        disabled={isLocating}
        aria-label="Find my location"
        className="absolute left-6 bottom-6 z-[400] w-14 h-14 glass rounded-[1.5rem] shadow-2xl flex items-center justify-center text-[hsl(160,10%,20%)] transition-all hover:text-[hsl(15,80%,65%)] disabled:opacity-50 border border-white/60"
      >
        <Crosshair size={24} className={isLocating ? "animate-spin text-[hsl(15,80%,65%)]" : ""} />
      </motion.button>

      {/* Zoom Controls — right side, low enough to always be in view */}
      <div className="absolute right-6 bottom-6 z-[400] flex flex-col glass rounded-[1.5rem] shadow-2xl border border-white/60 overflow-hidden">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In"
          className="w-14 h-14 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white/40 hover:text-[hsl(15,80%,65%)] transition-all border-b border-white/20"
        >
          <Plus size={22} />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out"
          className="w-14 h-14 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white/40 hover:text-[hsl(15,80%,65%)] transition-all"
        >
          <Minus size={22} />
        </button>
      </div>
    </div>
  );
}

export default memo(MapComponentContent);
