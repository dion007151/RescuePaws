import { useEffect, useRef, useState, memo } from "react";
import { Report } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Plus, Minus } from "lucide-react";

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
        
        // OPTIMIZATION: Removed lazy loading for Base64 icons to ensure instant visibility
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
              .marker-pin-wrapper {
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
              }
            </style>
            <div class="marker-pin-wrapper" style="
              animation: marker-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              animation-delay: ${Math.min(index * 0.02, 0.5)}s;
              position: relative;
              width: 52px;
              height: 52px;
            ">
              <div class="photo-pin" style="
                width: 52px;
                height: 52px;
                background: white;
                border: 4px solid ${color};
                border-radius: 50%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                ${photoHtml}
              </div>
              <div class="pin-stem" style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 10px solid ${color};
              "></div>
            </div>
          `,
          iconSize: [52, 58],
          iconAnchor: [26, 58],
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
    <div className="relative w-full h-full group">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* GPS Locate Button — positioned separately, always visible */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLocate}
        disabled={isLocating}
        aria-label="Find my location"
        className="absolute left-4 bottom-4 z-[400] w-14 h-14 bg-white/95 rounded-2xl shadow-2xl flex items-center justify-center text-[hsl(160,10%,20%)] transition-colors hover:text-[hsl(15,80%,65%)] disabled:opacity-50 border border-white/50 backdrop-blur-md"
      >
        <Crosshair size={24} className={isLocating ? "animate-spin" : ""} />
      </motion.button>

      {/* Zoom Controls — right side, low enough to always be in view */}
      <div className="absolute right-4 bottom-4 z-[400] flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In"
          className="w-12 h-12 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white hover:text-[hsl(15,80%,65%)] transition-colors border-b border-white/50"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out"
          className="w-12 h-12 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white hover:text-[hsl(15,80%,65%)] transition-colors"
        >
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
}

export default memo(MapComponentContent);
