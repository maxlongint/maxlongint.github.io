export default function LoadingFallback() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                gap: '1.5rem',
            }}
        >
            {/* ball-clip-rotate-multiple loader */}
            <div className="ball-clip-rotate-multiple">
                <div></div>
                <div></div>
            </div>
            <div
                style={{
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    fontWeight: 500,
                }}
            >
                加载中
            </div>
            <style>
                {`
                    .ball-clip-rotate-multiple {
                        position: relative;
                        width: 60px;
                        height: 60px;
                    }
                    
                    .ball-clip-rotate-multiple > div {
                        position: absolute;
                        left: 0;
                        top: 0;
                        border: 3px solid #3b82f6;
                        border-bottom-color: transparent;
                        border-top-color: transparent;
                        border-radius: 50%;
                        width: 60px;
                        height: 60px;
                        animation: ball-clip-rotate-multiple-rotate 1s ease-in-out infinite;
                    }
                    
                    .ball-clip-rotate-multiple > div:first-child {
                        border-color: #3b82f6 transparent;
                        animation-duration: 1s;
                        animation-delay: 0s;
                    }
                    
                    .ball-clip-rotate-multiple > div:last-child {
                        border-color: transparent #60a5fa;
                        width: 40px;
                        height: 40px;
                        left: 10px;
                        top: 10px;
                        animation-duration: 1s;
                        animation-direction: reverse;
                    }
                    
                    @keyframes ball-clip-rotate-multiple-rotate {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(180deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}
