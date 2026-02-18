import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    const LogSign = () => {
        navigate('/login');
    }

    return (
        <div >
            <div></div>
            <div></div>
            <div></div>

            <div>
                <h1>
                    <span>FlowState</span>
                </h1>
                <p>
                    Think, Plan, Execute
                </p>

                <button
                    onClick={LogSign}
                >
                    <div></div>
                    <span>
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </span>
                </button>

                <div>

                </div>
            </div>

            <footer>
                © {new Date().getFullYear()} FlowState. All rights reserved.
            </footer>
        </div>
    );
}

export default Landing;