import { useEffect, useState } from "react";

export function useSocketIp() {
    const [ip, setIp] = useState<string | null>(null);

    useEffect(() => {
        const storedIp = localStorage.getItem('ip');
        if (storedIp) {
            setIp(storedIp);
            return;
        }
        setIp(null);
    }, [setIp]);

    return { ip, setIp };
}