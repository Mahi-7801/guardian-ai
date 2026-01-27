import { Network, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api-config";

export interface Node {
  id: string;
  x: number;
  y: number;
  size: number;
  type: 'hub' | 'node' | 'threat';
}

export interface Edge {
  from: string;
  to: string;
}

const defaultNodes: Node[] = [
  { id: '1', x: 50, y: 50, size: 16, type: 'hub' },
  { id: '2', x: 25, y: 30, size: 10, type: 'node' },
  { id: '3', x: 75, y: 25, size: 10, type: 'node' },
  { id: '5', x: 80, y: 55, size: 10, type: 'node' },
  { id: '6', x: 35, y: 75, size: 8, type: 'node' },
  { id: '8', x: 15, y: 45, size: 6, type: 'node' },
  { id: '9', x: 85, y: 40, size: 6, type: 'node' },
];

const defaultEdges: Edge[] = [
  { from: '1', to: '2' },
  { from: '1', to: '3' },
  { from: '1', to: '5' },
  { from: '2', to: '8' },
  { from: '3', to: '9' },
  { from: '6', to: '1' },
];

interface NetworkGraphProps {
  nodes?: Node[];
  edges?: Edge[];
  refreshInterval?: number;
  viewMode?: 'default' | 'heatmap';
  zoomLevel?: number;
  onNodeClick?: (node: Node) => void;
}

export function NetworkGraph({
  nodes: initialNodes = defaultNodes,
  edges: initialEdges = defaultEdges,
  refreshInterval,
  viewMode = 'default',
  zoomLevel = 1,
  onNodeClick
}: NetworkGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: initialNodes, edges: initialEdges });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/network/graph`);
        if (res.ok) {
          const json = await res.json();
          const mappedNodes = json.nodes.map((n: any) => ({
            id: n.id,
            x: Math.random() * 90 + 5,
            y: Math.random() * 90 + 5,
            size: n.group === 0 ? 12 : 8,
            type: n.group === 0 ? 'hub' : n.group === 1 ? 'node' : 'threat'
          }));

          const mappedEdges = json.links.map((l: any) => ({
            from: l.source,
            to: l.target
          }));

          setData({ nodes: mappedNodes, edges: mappedEdges });
        }
      } catch (e) {
        console.error("Network graph fetch failed, using fallback");
      }
    };
    fetchData();
    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const activeNodeCount = data.nodes.filter(n => n.type !== 'threat').length;
  const threatCount = data.nodes.filter(n => n.type === 'threat').length;

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Network Topology</h2>
        </div>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div ref={canvasRef} className="relative w-full flex-1 min-h-[300px] bg-secondary/30 rounded-xl overflow-hidden">
        {/* SVG for edges */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {data.edges.map((edge, i) => {
            const fromNode = data.nodes.find(n => n.id === edge.from);
            const toNode = data.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className="stroke-primary/30"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {data.nodes.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            viewMode={viewMode}
            zoomLevel={zoomLevel}
            onClick={() => onNodeClick && onNodeClick(node)}
          />
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-foreground">{activeNodeCount * 7 + 100}</p>
          <p className="text-xs text-muted-foreground">Active Nodes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-destructive">{threatCount}</p>
          <p className="text-xs text-muted-foreground">Threats</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-success">98.2%</p>
          <p className="text-xs text-muted-foreground">Uptime</p>
        </div>
      </div>
    </div>
  );
}

function NetworkNode({ node, viewMode, zoomLevel, onClick }: { node: Node, viewMode: 'default' | 'heatmap', zoomLevel: number, onClick: () => void }) {
  const colors = {
    hub: 'bg-primary border-primary/50 glow-primary',
    node: 'bg-secondary border-border',
    threat: 'bg-destructive border-destructive/50 glow-destructive',
  };

  return (
    <div
      className={`absolute rounded-full border-2 transition-transform hover:scale-150 cursor-pointer ${colors[node.type]}`}
      onClick={onClick}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: node.size * zoomLevel * (viewMode === 'heatmap' ? 2.5 : 1),
        height: node.size * zoomLevel * (viewMode === 'heatmap' ? 2.5 : 1),
        transform: 'translate(-50%, -50%)',
        opacity: viewMode === 'heatmap' ? 0.6 : 1,
        filter: viewMode === 'heatmap' ? 'blur(4px)' : 'none',
        zIndex: 10
      }}
    >
      {node.type === 'threat' && viewMode === 'default' && (
        <div className="absolute inset-0 rounded-full bg-destructive animate-pulse-ring" />
      )}
    </div>
  );
}
