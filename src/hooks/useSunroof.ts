import { useState, useEffect } from "react";
import { useSocketIp } from "./useSocketIp";
import Swal from "sweetalert2";

export function useSunroof() {
    const { ip, setIp } = useSocketIp();
    const [sunroofState, setSunroofState] = useState<"closed" | "opening" | "closing" | "opened">("closed");

    const handleChangeState = (state: "closed" | "opening" | "closing" | "opened") => {
        setSunroofState(prev => (prev === state ? prev : state));
    }

    const validateIp = (ip: string) => {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    const handleFail = () => {
        console.log("Ip invalida");
        Swal.fire({
            title: "Ip invalida",
            text: "No se ha podido conectar al servidor",
            icon: "error"
        }).then(() => {
            setIp(null);
            localStorage.removeItem('ip');
            window.location.reload();
        });
    };

    const handleOpenSunroof = () => {
        if (sunroofState === "closed" || sunroofState === "closing") {
            setSunroofState("opening");
            sendSunroofState("opening");
        }
    };

    const handleCloseSunroof = () => {
        if (sunroofState === "opened" || sunroofState === "opening") {
            setSunroofState("closing");
            sendSunroofState("closing");
        }
    };

    const handleAnimationEnd = () => {
        if (sunroofState === "opening") {
            setSunroofState("opened");
        } else if (sunroofState === "closing") {
            setSunroofState("closed");
        }
    };

    const sendSunroofState = (state: "opening" | "closing") => {
        if (ip) {
            const ws = new WebSocket(`ws://${ip}/ws`);
            ws.onopen = () => {
                ws.send(JSON.stringify({ sunroofState: state }));
                ws.close();
            };
        }
    };

    useEffect(() => {
        if (!ip) return;

        if (!validateIp(ip)) {
            handleFail();
            return;
        }

        console.log(`Intentando conectar a ws://${ip}`);
        const ws = new WebSocket(`ws://${ip}/ws`);

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.sunroofState !== undefined && data.sunroofState !== null) {
                handleChangeState(data.sunroofState);
            }
        };

        ws.onerror = (error) => {
            console.log("error", error);
            handleFail();
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, [ip, setIp]);

    return { sunroofState, handleOpenSunroof, handleCloseSunroof, handleAnimationEnd };
}