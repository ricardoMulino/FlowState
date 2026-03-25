import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Telescope, Save, Download, LogOut, Upload } from 'lucide-react';
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
    return (
        <div className="px-6 py-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50 text-white min-w-[150px] flex items-center justify-center transition-all hover:bg-slate-800/80 hover:border-blue-500/50 cursor-grab active:cursor-grabbing">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-slate-950" />
            <div className="font-medium text-slate-200">{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-slate-950" />
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
                    <p className="text-slate-400 mt-1">Manage your high-level projects and over-arching goals</p>
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
                <Telescope className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-400">No projects yet</h3>
                <p className="text-slate-500 mt-2">Establish your first project to construct your vision</p>
                <button
                    onClick={() => setIsProjectOpen(true)}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Project
                </button>
            </div>
        </div>
    );
};
