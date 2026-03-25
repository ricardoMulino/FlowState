import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Telescope, Save, LogOut, Upload, Trash2, Clock, DollarSign, FileText, HardHat } from 'lucide-react';
import ReactFlow, {
    ReactFlowProvider,
    useReactFlow,
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

const RootNode = ({ data }: { data: any }) => {
    const [title, setTitle] = useState(data.label || 'Project Scope');
    const [budget, setBudget] = useState(data.budget || '');
    const [date, setDate] = useState(data.date || '');
    const [scope, setScope] = useState(data.scope || '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(e.target.value);
        data[field] = e.target.value;
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) {
            setBudget('');
            data.budget = '';
            return;
        }
        const formatted = parseInt(val, 10).toLocaleString('en-US');
        setBudget(formatted);
        data.budget = formatted;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        
        let formatted = val;
        if (val.length >= 5) {
            formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        } else if (val.length >= 3) {
            formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        
        setDate(formatted);
        data.date = formatted;
    };

    return (
        <div className="flex flex-col w-[200px] rounded-2xl bg-indigo-950/90 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] overflow-visible text-slate-200 transition-all hover:border-indigo-400/50 cursor-grab active:cursor-grabbing group">
            {/* Header */}
            <div className="bg-indigo-900/40 p-2.5 border-b border-indigo-500/20 rounded-t-2xl flex items-center gap-2">
                <Telescope className="w-4 h-4 text-indigo-400 shrink-0" />
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => handleChange(e, 'label', setTitle)}
                    placeholder="Project Name"
                    style={{ fontSize: `${Math.max(10, 14 - Math.max(0, title.length - 15) * 0.2)}px` }}
                    className="font-bold text-white tracking-tight leading-tight bg-transparent border-b border-transparent hover:border-indigo-400/50 focus:border-indigo-400 outline-none w-full transition-colors cursor-text"
                />
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-3">
                {/* Meta Inputs: Budget & Date (Stacked for small width) */}
                <div className="flex flex-col gap-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-[7.5px] uppercase tracking-widest text-indigo-300/70 font-bold ml-1">Budget Limit</label>
                        <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1.5 border border-indigo-500/10 focus-within:border-indigo-500/40 transition-colors">
                            <DollarSign className="w-3 h-3 text-emerald-400 shrink-0" />
                            <input 
                                type="text"
                                value={budget}
                                onChange={handleBudgetChange}
                                placeholder="$0"
                                className="bg-transparent text-[10px] font-medium text-emerald-100 outline-none w-full placeholder:text-emerald-500/30"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[7.5px] uppercase tracking-widest text-indigo-300/70 font-bold ml-1">Target Date</label>
                        <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1.5 border border-indigo-500/10 focus-within:border-indigo-500/40 transition-colors">
                            <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                            <input 
                                type="text"
                                value={date}
                                onChange={handleDateChange}
                                placeholder="MM/DD/YYYY"
                                className="bg-transparent text-[10px] font-medium text-blue-100 outline-none w-full placeholder:text-blue-500/30"
                            />
                        </div>
                    </div>
                </div>

                {/* Scope Description */}
                <div className="space-y-1">
                    <label className="text-[7.5px] uppercase tracking-widest text-indigo-300/70 font-bold ml-1">Scope Description</label>
                    <textarea 
                        value={scope}
                        onChange={(e) => handleChange(e, 'scope', setScope)}
                        placeholder="Define boundaries..."
                        style={{ fontSize: `${Math.max(7, 9 - Math.max(0, scope.length - 40) * 0.05)}px` }}
                        className="w-full bg-black/20 rounded-lg px-2 py-1.5 border border-indigo-500/10 focus:border-indigo-500/40 transition-colors font-medium text-indigo-100 outline-none resize-none placeholder:text-indigo-500/30 min-h-[45px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent"
                    />
                </div>
            </div>

            {/* PROMINENT OUTPUT BUBBLE */}
            <Handle 
                type="source" 
                position={Position.Right} 
                className="w-4 h-4 bg-purple-400 border-2 border-slate-900 rounded-full !-mr-2 z-10 transition-transform group-hover:scale-110 flex items-center justify-center shadow-lg shadow-purple-500/20" 
                title="Output Connection"
            />
        </div>
    );
};

const CustomNode = ({ data }: { data: any }) => {
    // Default data structure if not provided
    const [title, setTitle] = useState(data.label || 'New Task');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        data.label = e.target.value; // Mutate for saving
    };

    const nodeData = {
        title: title,
        status: data.status || 'pending', // pending, on-track, at-risk, delayed
        cost: data.cost || null,
        time: data.time || null,
        needs: data.needs || [],
        artifacts: data.artifacts || [],
        ...data,
        label: title // override
    };

    return (
        <div className="flex w-[180px] rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50 overflow-visible text-slate-200 transition-all hover:border-blue-500/50 hover:bg-slate-800/90 cursor-grab active:cursor-grabbing group">
            {/* Inputs Zone (Left) */}
            <div className="w-[1rem] shrink-0 rounded-l-xl bg-emerald-950/20 flex flex-col items-center justify-center border-r border-emerald-500/20 relative">
                {/* PROMINENT INPUT BUBBLE */}
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    className="w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full !-ml-1.5 z-10 transition-transform group-hover:scale-110 flex items-center justify-center shadow-lg shadow-emerald-500/20" 
                    title="Input Dependency"
                />
            </div>

            {/* Body Zone (Center) */}
            <div className="flex-1 p-1 flex flex-col gap-1">
                {/* Editable Header */}
                <input 
                    type="text" 
                    value={title} 
                    onChange={handleTitleChange} 
                    placeholder="Task Name"
                    style={{ fontSize: `${Math.max(8, 11 - Math.max(0, title.length - 12) * 0.2)}px` }}
                    className="font-bold text-white tracking-tight leading-tight bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500 outline-none w-full transition-colors cursor-text px-1"
                />

                {/* AI Estimates Badges */}
                <div className="flex flex-wrap gap-1">
                    {nodeData.cost ? (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px] font-semibold">
                            <DollarSign className="w-2 h-2" />
                            {nodeData.cost}
                        </div>
                    ) : null}

                    {nodeData.time ? (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[7px] font-semibold">
                            <Clock className="w-2 h-2" />
                            {nodeData.time}
                        </div>
                    ) : null}
                    
                    {!nodeData.cost && !nodeData.time && (
                        <div className="flex-1 flex items-center justify-center py-0.5 rounded bg-slate-800/50 border border-white/5 border-dashed">
                            <span className="text-[7px] uppercase tracking-widest text-slate-500 font-semibold animate-pulse">AI Pending</span>
                        </div>
                    )}
                </div>

                {/* Needs List */}
                <div className="bg-slate-950/60 border border-white/5 rounded p-1">
                    <div className="text-[7px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold">Needs</div>
                    <div className="flex flex-wrap gap-0.5">
                        {nodeData.needs.length > 0 ? nodeData.needs.map((need: string, i: number) => (
                            <span key={i} className="flex items-center gap-0.5 text-[8px] font-medium text-slate-300 bg-white/5 px-1 py-[1px] rounded-[3px] border border-white/5">
                                <HardHat className="w-2 h-2 text-slate-400" />
                                {need}
                            </span>
                        )) : (
                            <span className="text-[8px] text-slate-600 italic px-0.5">None</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Outputs Zone (Right) */}
            <div className="w-[3.5rem] shrink-0 bg-purple-900/10 p-1 flex flex-col items-center justify-center border-l border-purple-500/20 relative rounded-r-xl">
                <span className="text-[7px] text-purple-400/60 uppercase tracking-widest mb-1 font-bold text-center w-full">Out</span>
                <div className="flex flex-col gap-0.5 w-full">
                    {nodeData.artifacts.length > 0 ? nodeData.artifacts.map((artifact: string, i: number) => (
                        <div key={i} className="flex items-center justify-center gap-0.5 text-[7px] font-semibold text-purple-300 bg-purple-500/10 px-0.5 py-[2px] rounded-[3px] border border-purple-500/20 w-full text-center shadow-sm border-r border-r-purple-400 overflow-hidden" title={artifact}>
                            <FileText className="w-2 h-2 shrink-0 opacity-70" />
                            <span className="truncate">{artifact}</span>
                        </div>
                    )) : (
                        <div className="flex items-center justify-center py-[2px] rounded-[3px] bg-purple-900/10 border border-purple-500/10 border-dashed w-full">
                            <span className="text-[6px] uppercase tracking-widest text-purple-400/50 font-semibold">TBD</span>
                        </div>
                    )}
                </div>
                {/* PROMINENT OUTPUT BUBBLE */}
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    className="w-3.5 h-3.5 bg-purple-400 border-2 border-slate-900 rounded-full !-mr-[7px] z-10 transition-transform group-hover:scale-110 flex items-center justify-center shadow-lg shadow-purple-500/20" 
                    title="Output Connection"
                />
            </div>
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
    root: RootNode
};

const initialNodes = [
    {
        id: '1',
        type: 'root',
        position: { x: 250, y: 250 },
        data: { label: 'Project Scope' },
    },
];

const ProjectBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { screenToFlowPosition } = useReactFlow();
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

    // DAG Cycle Detection
    const isValidConnection = useCallback(
        (connection: Connection) => {
            if (connection.source === connection.target) return false;

            const target = connection.target;
            const source = connection.source;
            const queue = [target];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const currentId = queue.shift()!;
                if (currentId === source) return false;

                if (!visited.has(currentId)) {
                    visited.add(currentId);
                    const outgoers = edges
                        .filter((edge) => edge.source === currentId)
                        .map((edge) => edge.target);
                        
                    for (const outgoer of outgoers) {
                        if (!visited.has(outgoer)) queue.push(outgoer);
                    }
                }
            }
            return true;
        },
        [edges]
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
        const position = screenToFlowPosition({ x: menu.left, y: menu.top });
        const newNode = {
            id: Date.now().toString(),
            type: 'custom',
            position,
            data: { 
                label: 'New Task',
                status: 'pending',
                needs: [],
                artifacts: [],
                time: '',
                cost: ''
            }
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
                isValidConnection={isValidConnection}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={onPaneClick}
                onNodeClick={onPaneClick}
                defaultEdgeOptions={{ 
                    style: { stroke: '#94a3b8' },
                    animated: false
                }}
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
        return (
            <ReactFlowProvider>
                <ProjectBoard onClose={() => setIsProjectOpen(false)} />
            </ReactFlowProvider>
        );
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
