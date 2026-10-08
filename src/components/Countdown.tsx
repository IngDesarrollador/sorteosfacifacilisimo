    import React, { useState, useEffect } from 'react';

    interface CountdownProps {
    onComplete: () => void;
    }

    const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count > 0) {
        const timer = setTimeout(() => {
            setCount(count - 1);
        }, 1000);
        return () => clearTimeout(timer);
        } else {
        onComplete();
        }
    }, [count, onComplete]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
            <div className="text-9xl font-black text-yellow-400 animate-pulse mb-4">
            {count}
            </div>
            <div className="text-2xl text-white font-semibold">
            ¡Preparando resultados!
            </div>
        </div>
        </div>
    );
    };

    export default Countdown;
