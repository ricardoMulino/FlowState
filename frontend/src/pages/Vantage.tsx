import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Telescope, Save, LogOut, Trash2, Clock, DollarSign, FileText, HardHat } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';

// ─── Debounce hook ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const RootNode = ({ data }: { data: any }) => {
    const [title, setTitle] = useState(data.label && data.label !== 'Project Scope' ? data.label : '');
    const [budget, setBudget] = useState(data.budget || '');
    const [date, setDate] = useState(data.date || '');
    const [scope, setScope] = useState(data.scope || '');

    // Propagate changes to parent via data callbacks
    const fireChange = (patch: Record<string, string>) => {
        Object.assign(data, patch);
        data.onInputChange?.({ ...data, ...patch });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(e.target.value);
        fireChange({ [field]: e.target.value });
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) {
            setBudget('');
            fireChange({ budget: '' });
            return;
        }
        const formatted = parseInt(val, 10).toLocaleString('en-US');
        setBudget(formatted);
        fireChange({ budget: formatted });
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
        fireChange({ date: formatted });
    };

    const isGenerating = data.isGenerating || false;

    return (
        <div className="flex flex-col w-[200px] rounded-2xl bg-indigo-950/90 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] overflow-visible text-slate-200 transition-all hover:border-indigo-400/50 cursor-grab active:cursor-grabbing group">
            {/* Header */}
            <div className="bg-indigo-900/40 p-2.5 border-b border-indigo-500/20 rounded-t-2xl flex items-center gap-2">
                <Telescope className={`w-4 h-4 shrink-0 ${isGenerating ? 'text-purple-400 animate-pulse' : 'text-indigo-400'}`} />
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => { setTitle(e.target.value); fireChange({ label: e.target.value }); }}
                    placeholder="Project Name"
                    style={{ fontSize: `${Math.max(10, 14 - Math.max(0, title.length - 15) * 0.2)}px` }}
                    className="font-bold text-white tracking-tight leading-tight bg-transparent border-b border-transparent hover:border-indigo-400/50 focus:border-indigo-400 outline-none w-full transition-colors cursor-text"
                />
            </div>

            {/* AI generating indicator */}
            {isGenerating && (
                <div className="px-3 py-1.5 bg-purple-900/30 border-b border-purple-500/20 flex items-center gap-2">
                    <div className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{animationDelay:'300ms'}} />
                    </div>
                    <span className="text-[8px] text-purple-300 font-semibold uppercase tracking-widest">AI thinking...</span>
                </div>
            )}

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
        id: 'root-1',
        type: 'root',
        position: { x: 250, y: 250 },
        data: { label: 'Project Scope' },
    },
];

const ProjectBoard: React.FC<{ project?: any, onClose: () => void }> = ({ project, onClose }) => {
    const { email } = useAuth();
    const { screenToFlowPosition } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [menu, setMenu] = useState<{ id?: string, top: number, left: number } | null>(null);

    // ─── Reactive AI generation ─────────────────────────────────────────────
    const [rootInput, setRootInput] = useState({ title: '', scope: '', budget: '' });
    const debouncedRoot = useDebounce(rootInput, 1500);
    const [, setIsGenerating] = useState(false); // drives root node indicator via data.isGenerating

    // Callback wired into RootNode via node.data.onInputChange
    const handleRootInputChange = useCallback((data: any) => {
        setRootInput({ title: data.label || '', scope: data.scope || '', budget: data.budget || '' });
    }, []);

    // When debounced input settles with a meaningful title, call AI
    useEffect(() => {
        if (!debouncedRoot.title || debouncedRoot.title.length < 3) return;
        setIsGenerating(true);
        // Mark root node as generating
        setNodes(nds => nds.map(n => n.type === 'root' ? { ...n, data: { ...n.data, isGenerating: true, onInputChange: handleRootInputChange } } : n));

        fetch('http://localhost:8000/api/projects/generate-nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: debouncedRoot.title, scope: debouncedRoot.scope, budget: debouncedRoot.budget })
        })
        .then(r => r.json())
        .then(({ tasks }) => {
            if (!tasks || tasks.length === 0) return;

            // Build nodes with left-to-right DAG layout
            // Group by dependency depth (topological layers)
            const idMap: Record<string, string> = {}; // original id -> react-flow id
            const depthMap: Record<string, number> = {};

            // Compute depth per node
            const getDepth = (taskId: string, visited = new Set<string>()): number => {
                if (taskId in depthMap) return depthMap[taskId];
                if (visited.has(taskId)) return 0;
                visited.add(taskId);
                const task = tasks.find((t: any) => t.id === taskId);
                if (!task || !task.connected_tasks?.length) {
                    depthMap[taskId] = 0;
                    return 0;
                }
                const maxParentDepth = Math.max(...task.connected_tasks.map((pid: string) => getDepth(pid, visited)));
                depthMap[taskId] = maxParentDepth + 1;
                return depthMap[taskId];
            };
            tasks.forEach((t: any) => getDepth(t.id));

            // Group by layer
            const layerMap: Record<number, any[]> = {};
            tasks.forEach((t: any) => {
                const d = depthMap[t.id] || 0;
                if (!layerMap[d]) layerMap[d] = [];
                layerMap[d].push(t);
            });

            const ROOT_X = 100, ROOT_Y = 80;
            const X_GAP = 260, Y_GAP = 160;

            const newNodes = tasks.map((t: any) => {
                const layer = depthMap[t.id] || 0;
                const layerItems = layerMap[layer];
                const idxInLayer = layerItems.indexOf(t);
                const rfId = `ai-${t.id}-${Date.now()}`;
                idMap[t.id] = rfId;
                return {
                    id: rfId,
                    type: 'custom',
                    position: {
                        x: ROOT_X + (layer + 1) * X_GAP,
                        y: ROOT_Y + idxInLayer * Y_GAP
                    },
                    data: {
                        label: t.label,
                        cost: t.cost,
                        time: t.time,
                        needs: t.needs || [],
                        artifacts: t.artifacts || [],
                        status: 'pending'
                    }
                };
            });

            // Build edges (dependency arrows)
            const newEdges: Edge[] = [];

            // Edge from root to each layer-0 node
            const rootNode = nodes.find(n => n.type === 'root');
            const rootId = rootNode?.id || 'root-1';
            Object.values(layerMap[0] || []).forEach((t: any) => {
                const targetId = idMap[t.id];
                if (targetId) newEdges.push({
                    id: `e-root-${targetId}`,
                    source: rootId,
                    target: targetId,
                    style: { stroke: '#818cf8' },
                    animated: true
                });
            });

            // Inter-task dependency edges
            tasks.forEach((t: any) => {
                const targetId = idMap[t.id];
                (t.connected_tasks || []).forEach((depId: string) => {
                    const sourceId = idMap[depId];
                    if (sourceId && targetId) newEdges.push({
                        id: `e-${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId,
                        style: { stroke: '#94a3b8' }
                    });
                });
            });

            setNodes(nds => {
                const rootNodes = nds.filter(n => n.type === 'root').map(n => ({ ...n, data: { ...n.data, isGenerating: false, onInputChange: handleRootInputChange } }));
                return [...rootNodes, ...newNodes];
            });
            setEdges(newEdges);
        })
        .catch(err => console.error('[AI Gen Error]', err))
        .finally(() => setIsGenerating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedRoot.title, debouncedRoot.scope, debouncedRoot.budget]);

    // Wire onInputChange callback into root node data when component mounts/project changes
    useEffect(() => {
        setNodes(nds => nds.map(n => n.type === 'root'
            ? { ...n, data: { ...n.data, onInputChange: handleRootInputChange } }
            : n
        ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleRootInputChange]);

    // Load saved project on mount
    useEffect(() => {
        if (project && project.tasks) {
            const newNodes = project.tasks.map((t: any) => ({
                id: t.task_client_id,
                type: t.data?.type || 'custom',
                position: { x: t.x || 0, y: t.y || 0 },
                data: { ...t.data, onInputChange: t.data?.type === 'root' ? handleRootInputChange : undefined }
            }));
            
            const newEdges: Edge[] = [];
            project.tasks.forEach((t: any) => {
                if (t.connected_tasks) {
                    t.connected_tasks.forEach((targetId: string) => {
                        newEdges.push({
                            id: `e-${t.task_client_id}-${targetId}`,
                            source: t.task_client_id,
                            target: targetId,
                            style: { stroke: '#94a3b8' }
                        });
                    });
                }
            });
            
            setNodes(newNodes);
            setEdges(newEdges);
        } else {
            setNodes(nds => nds.map(n => n.type === 'root' ? { ...n, data: { ...n.data, onInputChange: handleRootInputChange } } : n));
            setEdges([]);
        }
    }, [project, setNodes, setEdges, handleRootInputChange]);


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

    const handleSave = async () => {
        if (!email) {
            alert("No user email found to save project.");
            return;
        }

        const rootNode = nodes.find(n => n.type === 'root') || nodes[0];
        const projectTitle = rootNode?.data?.label || 'New Project';
        const project_id = project?.project_id || Date.now().toString();

        const projectTasks = nodes.map(node => {
            const connected_tasks = edges
                .filter(e => e.source === node.id)
                .map(e => e.target);
                
            return {
                task_client_id: node.id,
                x: node.position.x,
                y: node.position.y,
                connected_tasks: connected_tasks,
                data: { ...node.data, type: node.type }
            };
        });

        const payload = {
            email,
            project_id,
            title: projectTitle,
            tasks: projectTasks
        };

        try {
            const res = await fetch(`http://localhost:8000/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Project saved successfully!");
            } else {
                alert("Failed to save project.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving project.");
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
    const { email } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<any | null>(null);
    const [isProjectOpen, setIsProjectOpen] = useState(false);

    useEffect(() => {
        if (!email) return;
        fetch(`http://localhost:8000/api/projects/${email}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProjects(data);
            })
            .catch(console.error);
    }, [email, isProjectOpen]);

    const handleCreateProject = () => {
        setActiveProject(null);
        setIsProjectOpen(true);
    };

    const handleOpenProject = (proj: any) => {
        setActiveProject(proj);
        setIsProjectOpen(true);
    };

    const handleDeleteProject = async (proj: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${proj.title}"?`)) return;
        
        try {
            const res = await fetch(`http://localhost:8000/api/projects/${email}/${proj.project_id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.project_id !== proj.project_id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isProjectOpen) {
        return (
            <ReactFlowProvider>
                <ProjectBoard 
                    project={activeProject}
                    onClose={() => setIsProjectOpen(false)} 
                />
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
                    <p className="text-muted-foreground mt-1">Manage your high-level projects and over-arching goals</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <Telescope className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground/70">No projects yet</h3>
                    <p className="text-muted-foreground mt-2">Establish your first project to construct your vision</p>
                    <button
                        onClick={handleCreateProject}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-foreground/80 transition-colors border border-border"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <div 
                            key={p.project_id}
                            onClick={() => handleOpenProject(p)}
                            className="bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all cursor-pointer group relative flex flex-col items-start min-h-[140px]"
                        >
                            <div className="flex items-start justify-between w-full mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                    <Telescope className="w-6 h-6 text-blue-400" />
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteProject(p, e)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-200 mb-2 truncate w-full">{p.title || 'Untitled Project'}</h3>
                            <p className="text-sm text-slate-400">{p.tasks?.length || 0} nodes defined</p>
                        </div>
                    ))}
                    
                    {/* Add New Project Card */}
                    <div 
                        onClick={handleCreateProject}
                        className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-blue-500/50 hover:bg-slate-800/30 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 min-h-[140px]"
                    >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Create New Project</span>
                    </div>
                </div>
            )}
        </div>
    );
};
