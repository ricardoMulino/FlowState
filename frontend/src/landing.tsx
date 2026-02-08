import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    const LogSign = () => {
        navigate('/login');
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            <button
                onClick={LogSign}
                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
                Login/Sign-up
            </button>
        </div>
    );
}

export default Landing;