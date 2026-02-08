import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-lg w-full">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
                        <pre className="bg-black/50 p-4 rounded-lg overflow-auto text-sm text-red-200 font-mono">
                            {this.state.error?.message}
                        </pre>
                        <button
                            className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
