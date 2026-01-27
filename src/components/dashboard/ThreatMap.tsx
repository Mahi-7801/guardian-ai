import { useEffect, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Globe, Activity, Loader2, Zap as ZapIcon, Target } from "lucide-react";
import { insforge } from "@/lib/insforge";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";

interface ThreatLocation {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'critical' | 'warning' | 'info';
  count: number;
}

const initialLocations: ThreatLocation[] = [];

// Reliable Dark Matter tiles
const mapStyle = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
        "https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
        "https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO"
    }
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "osm-tiles", minzoom: 0, maxzoom: 19 }]
} as any;

export function ThreatMap() {
  const [locations, setLocations] = useState<ThreatLocation[]>([]);
  const [targetIp, setTargetIp] = useState("");
  const [targetName, setTargetName] = useState("");
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5
  });
  const [isIngesting, setIsIngesting] = useState(false);

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIp) return;

    setIsIngesting(true);
    toast.loading(`Intercepting signal for: ${targetIp}...`, { id: "geo-track" });

    try {
      // Use real IP Geolocation API
      const res = await fetch(`http://ip-api.com/json/${targetIp}`);
      const data = await res.json();

      if (data.status === 'success') {
        const newTarget: ThreatLocation = {
          id: `manual-${Date.now()}`,
          latitude: data.lat,
          longitude: data.lon,
          severity: 'critical',
          count: 1,
          label: targetName || targetIp
        } as any;

        setLocations(prev => [newTarget, ...prev]);
        setViewState({ latitude: data.lat, longitude: data.lon, zoom: 6 });
        toast.success(`Target Locked: ${data.city}, ${data.country}`, { id: "geo-track" });
      } else {
        throw new Error("Invalid IP or Trace Denied");
      }
    } catch (err) {
      toast.error("Trace failed. Ghost IP or VPN detected.", { id: "geo-track" });
    } finally {
      setIsIngesting(false);
      setTargetIp("");
      setTargetName("");
    }
  };

  useEffect(() => {
    const fetchRealThreats = async () => {
      try {
        // Parallel fetch for Threats and CROSINT Reports
        const [threatsRes, reportsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/threats`),
          fetch(`${API_BASE_URL}/api/reports`)
        ]);

        let combinedData: ThreatLocation[] = [];

        if (threatsRes.ok) {
          const threats = await threatsRes.json();
          const mappedThreats = threats.map((t: any) => ({
            id: t.id,
            latitude: t.latitude || 0,
            longitude: t.longitude || 0,
            severity: t.severity,
            count: 1,
            type: t.type
          }));
          combinedData = [...mappedThreats];
        }

        if (reportsRes.ok) {
          const reports = await reportsRes.json();
          // Map reports to map if they have coordinates (simulated or parsed)
          // For now, we only show reports that we can geolocate or use the default Guntur/Hyderabad logic
          const mappedReports = reports.map((r: any) => {
            const loc = r.data.location.toLowerCase();
            let coords = { lat: 0, lng: 0 };
            if (loc.includes('guntur')) coords = { lat: 16.3067, lng: 80.4365 };
            else if (loc.includes('hyderabad')) coords = { lat: 17.3850, lng: 78.4867 };
            else if (loc.includes('amaravati')) coords = { lat: 16.5062, lng: 80.5480 };

            if (coords.lat !== 0) {
              return {
                id: r.id,
                latitude: coords.lat + (Math.random() * 0.1), // Add slight jitter for multiple reports in same city
                longitude: coords.lng + (Math.random() * 0.1),
                severity: 'info',
                count: 1,
                label: `INTEL: ${r.id.slice(0, 6)}`
              };
            }
            return null;
          }).filter(Boolean);

          combinedData = [...combinedData, ...mappedReports];
        }

        setLocations(combinedData);
      } catch (e) {
        console.warn("Live threat map uplink offline");
      }
    };

    fetchRealThreats();
    const interval = setInterval(fetchRealThreats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Global Threat Map (OSM)</h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/30 ml-2">
            <Activity className="w-3 h-3 text-success animate-pulse-glow" />
            <span className="text-[10px] text-success font-bold uppercase tracking-tighter">Live Uplink</span>
          </div>
        </div>

        {/* Manual Ingestion Form */}
        <form onSubmit={handleManualIngest} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Target IP..."
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              className="h-8 w-32 px-3 rounded bg-secondary/50 border border-border text-[10px] focus:border-primary outline-none transition-all font-mono"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Identity..."
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="h-8 w-32 px-3 rounded bg-secondary/50 border border-border text-[10px] focus:border-primary outline-none transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isIngesting || !targetIp}
            className="h-8 px-3 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:glow-primary transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isIngesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ZapIcon className="w-3 h-3" />} TRACK
          </button>
        </form>
      </div>

      <div className="relative flex-1 w-full bg-secondary/50 rounded-xl overflow-hidden border border-border/50">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {locations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="center"
            >
              <div className="relative cursor-pointer group">
                <div className={`w-3 h-3 rounded-full border-2 border-white/50 animate-pulse-ring opacity-50 absolute inset-0 ${location.severity === 'critical' ? 'bg-destructive shadow-[0_0_10px_rgba(220,38,38,0.5)]' :
                  location.severity === 'warning' ? 'bg-warning' : 'bg-success'
                  }`} />
                <div className={`relative w-3 h-3 rounded-full border border-card shadow-lg flex items-center justify-center ${(location as any).label
                  ? "bg-destructive scale-150 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-50 transition-transform duration-500"
                  : location.severity === 'critical' ? 'bg-destructive' :
                    location.severity === 'warning' ? 'bg-warning' : 'bg-success'
                  }`}>
                  {(location as any).label && <Target className="w-2 h-2 text-white animate-spin" />}
                </div>

                {/* Target Label if available */}
                {(location as any).label && (
                  <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-destructive px-2 py-0.5 rounded text-[8px] font-black text-white whitespace-nowrap shadow-lg border border-white/20 animate-fade-in uppercase tracking-tighter">
                    TARGET: {(location as any).label}
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card/90 backdrop-blur border border-border rounded text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {location.count} threats detected
                </div>
              </div>
            </Marker>
          ))}
        </Map>

        {/* Scan line effect overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-[2px] bg-primary/20 animate-scan z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <LegendItem color="destructive" label="Critical" />
        <LegendItem color="warning" label="Warning" />
        <LegendItem color="success" label="Monitored" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const colorClasses: Record<string, string> = {
    destructive: 'bg-destructive',
    warning: 'bg-warning',
    success: 'bg-success',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
