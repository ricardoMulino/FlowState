import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Telescope, Save, LogOut, Upload, Trash2, Clock, DollarSign, FileText, HardHat } from 'lucide-react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position
} from 'reactflow';
import type { Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data }: { data: any }) => {
    // Default data structure if not provided
    const nodeData = {
        title: data.label || 'Pour Concrete Foundation',
        status: data.status || 'on-track', // on-track, at-risk, delayed
        cost: data.cost || '$5,000',
        time: data.time || '3 Days',
        needs: data.needs || ['3 Laborers', '2 Cement Trucks', '1 Pump'],
        artifacts: data.artifacts || ['Foundation Complete'],
        ...data
    };

    const statusColors: Record<string, string> = {
        'on-track': 'bg-emerald-500',
        'at-risk': 'bg-amber-500',
        'delayed': 'bg-rose-500'
    };

    return (
        <div className="flex w-[480px] rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden text-slate-200 transition-all hover:border-blue-500/50 hover:bg-slate-800/90 cursor-grab active:cursor-grabbing">
            {/* Status Indicator Strip */}
            <div className={`w-2 shrink-0 ${statusColors[nodeData.status] || 'bg-slate-500'}`} />

            {/* Inputs Zone (Left) */}
            <div className="w-16 bg-slate-800/50 flex flex-col items-center justify-center border-r border-white/5 relative">
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    className="w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full !ml-0" 
                    style={{ left: -10 }}
                />
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 -rotate-90 whitespace-nowrap">
                    Inputs
                </span>
            </div>

            {/* Body Zone (Center) */}
            <div className="flex-1 p-5 flex flex-col gap-4">
                {/* Header */}
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{nodeData.title}</h3>

                {/* AI Estimates Badges */}
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {nodeData.cost}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                        <Clock className="w-4 h-4" />
                        {nodeData.time}
                    </div>
                </div>

                {/* Needs List */}
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Needs</div>
                    <div className="flex flex-wrap gap-2">
                        {nodeData.needs.map((need: string, i: number) => (
                            <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                <HardHat className="w-3.5 h-3.5 text-slate-400" />
                                {need}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Outputs Zone (Right) */}
            <div className="w-36 bg-slate-800/30 p-4 flex flex-col items-end justify-center border-l border-white/5 relative">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold text-right w-full">Outputs</span>
                <div className="flex flex-col gap-2 w-full">
                    {nodeData.artifacts.map((artifact: string, i: number) => (
                        <div key={i} className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 w-full text-right shadow-sm border-r-2 border-r-purple-400">
                            <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{artifact}</span>
                        </div>
                    ))}
                </div>
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    className="w-4 h-4 bg-purple-400 border-2 border-slate-900 rounded-full !mr-0" 
                    style={{ right: -10 }}
                />
            </div>
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes = [
    { id: '1', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Start Project' } }
];

const ProjectBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [menu, setMenu] = useState<{ id?: string, top: number, left: number } | null>(null);

    // Load project on mount
    useEffect(() => {
        const savedProject = localStorage.getItem('flowstate_vantage_project');
        if (savedProject) {
            try {
                const parsed = JSON.parse(savedProject);
                if (parsed.nodes && parsed.edges) {
                    setNodes(parsed.nodes);
                    setEdges(parsed.edges);
                }
            } catch (e) {
                console.error("Failed to parse saved project:", e);
            }
        }
    }, [setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        setMenu({
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
        event.preventDefault();
        setMenu({
            id: node.id,
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    const onPaneClick = useCallback(() => {
        setMenu(null);
    }, []);

    const handleAddNode = () => {
        if (!menu) return;
        const newNode = {
            id: Date.now().toString(),
            type: 'custom',
            position: { x: (Math.random() * 200) + 100, y: (Math.random() * 200) + 100 },
            data: { label: 'New Node' }
        };
        setNodes((nds) => nds.concat(newNode));
        setMenu(null);
    };

    const handleDeleteNode = () => {
        if (!menu || !menu.id) return;
        setNodes((nds) => nds.filter((n) => n.id !== menu.id));
        setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
        setMenu(null);
    };

    const handleSave = () => {
        const data = { nodes, edges };
        localStorage.setItem('flowstate_vantage_project', JSON.stringify(data));
        alert("Project saved successfully!");
    };

    const handleImport = () => {
        const input = window.prompt("Paste your project JSON plaintext:");
        if (input) {
            try {
                const parsed = JSON.parse(input);
                if (parsed.nodes && parsed.edges) {
                    setNodes(parsed.nodes);
                    setEdges(parsed.edges);
                    alert("Project imported successfully!");
                } else {
                    alert("Invalid format: missing nodes or edges array.");
                }
            } catch (e) {
                alert("Failed to parse JSON. Please check your plaintext.");
            }
        }
    };

    // For debugging or simple export, optionally we could add export handling, but import focuses on JSON text
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col m-0 p-0 overflow-hidden">
            {/* Toolbar overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
                    <Telescope className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Vantage Canvas
                    </h2>
                </div>
                
                <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium border border-white/10 text-sm"
                        title="Import JSON plaintext"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <div className="w-[1px] h-6 bg-white/10 mx-1" />
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-medium border border-red-500/20 text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Quit
                    </button>
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={onPaneClick}
                onNodeClick={onPaneClick}
                fitView
                className="bg-slate-950"
            >
                <Background color="#334155" gap={16} />
                <Controls className="mb-4 ml-4" showInteractive={false} />
                <MiniMap 
                    nodeColor="#3b82f6" 
                    nodeBorderRadius={4}
                    className="mb-4 mr-4"
                />
            </ReactFlow>

            {/* Fuzzy Context Menu */}
            {menu && (
                <div 
                    className="absolute z-[200] w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-xl overflow-hidden animate-fade-in"
                    style={{ top: menu.top, left: menu.left }}
                >
                    <div className="p-1">
                        {!menu.id ? (
                            <button
                                onClick={handleAddNode}
                                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-blue-500/30 rounded-lg transition-colors flex items-center gap-3 font-medium"
                            >
                                <Plus className="w-4 h-4 text-blue-400" />
                                Add Node
                            </button>
                        ) : (
                            <button
                                onClick={handleDeleteNode}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-3 font-medium cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Node
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Vantage: React.FC = () => {
    const [isProjectOpen, setIsProjectOpen] = useState(false);

    // If a project is open, strictly render the full screen mode immediately
    if (isProjectOpen) {
        return <ProjectBoard onClose={() => setIsProjectOpen(false)} />;
    }

    return (
        <div className="flex-1 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Vantage
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your high-level projects and over-arching goals</p>
                </div>
                <button
                    onClick={() => setIsProjectOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Project
                </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Telescope className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground/70">No projects yet</h3>
                <p className="text-muted-foreground mt-2">Establish your first project to construct your vision</p>
                <button
                    onClick={() => setIsProjectOpen(true)}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-foreground/80 transition-colors border border-border"
                >
                    <Plus className="w-4 h-4" />
                    Create Project
                </button>
            </div>
        </div>
    );
};
