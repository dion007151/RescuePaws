import { useEffect, useRef, useState } from "react";
import { Report } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Plus, Minus } from "lucide-react";

interface MapComponentProps {
  reports: Report[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (report: Report) => void;
  center?: [number, number];
}

export default function MapComponent({
  reports,
  onMapClick,
  onMarkerClick,
  center = [14.5995, 120.9842],
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;
      
      // Secondary check to see if the DOM element already has a leaflet instance
      if ((mapRef.current as any)._leaflet_id) return;

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, 13);
      leafletMapRef.current = map;

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
    if (!leafletMapRef.current) return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      reports.forEach((report, index) => {
        const isRescued = report.status === "rescued";
        const color = isRescued ? "#10b981" : "#f8947b";
        
        const photoHtml = report.imageUrl 
          ? `<img src="${report.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
          : `<span style="font-size: 20px;">${report.animalType === "dog" ? "🐶" : report.animalType === "cat" ? "🐱" : "🐾"}</span>`;

        const icon = L.divIcon({
          className: "marker-pin-container",
          html: `
            <div class="marker-pin-wrapper" style="
              animation: marker-appear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              animation-delay: ${index * 0.05}s;
              position: relative;
              width: 48px;
              height: 48px;
            ">
              <div class="photo-pin" style="
                width: 48px;
                height: 48px;
                background: white;
                border: 3px solid ${color};
                border-radius: 50%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              ">
                ${photoHtml}
              </div>
              <div class="pin-stem" style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${color};
              "></div>
            </div>
          `,
          iconSize: [48, 54],
          iconAnchor: [24, 54],
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
      
      {/* Custom Controls */}
      <div className="absolute right-6 bottom-32 z-[400] flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLocate}
          disabled={isLocating}
          aria-label="Find my location"
          className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-[hsl(160,10%,20%)] transition-colors hover:text-[hsl(15,80%,65%)] disabled:opacity-50 border border-white/50 backdrop-blur-md bg-white/90"
        >
          <Crosshair size={24} className={isLocating ? "animate-spin" : ""} />
        </motion.button>

        <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="w-14 h-14 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white hover:text-[hsl(15,80%,65%)] transition-colors border-b border-white/50"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="w-14 h-14 flex items-center justify-center text-[hsl(160,10%,20%)] hover:bg-white hover:text-[hsl(15,80%,65%)] transition-colors"
          >
            <Minus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
