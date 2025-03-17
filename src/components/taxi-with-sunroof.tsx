import { useEffect, useRef } from "react"
import "./css/taxi-styles.css"

interface TaxiWithSunroofProps {
    sunroofState: "closed" | "opening" | "closing" | "opened"
    onAnimationEnd: () => void
}

export default function TaxiWithSunroof({ sunroofState, onAnimationEnd }: TaxiWithSunroofProps) {
    const sunroofRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const sunroofElement = sunroofRef.current
        if (sunroofElement) {
            sunroofElement.addEventListener("animationend", onAnimationEnd)
            return () => {
                sunroofElement.removeEventListener("animationend", onAnimationEnd)
            }
        }
    }, [onAnimationEnd])

    return (
        <div className="road">
            <div className="taxi">
                <div className="placa"/>
                <div className="light" />
                <span>
                    <b>
                        <u>
                            <em
                                ref={sunroofRef}
                                className={`sunroof ${sunroofState === "opening"
                                        ? "opening"
                                        : sunroofState === "closing"
                                            ? "closing"
                                            : sunroofState === "opened"
                                                ? "opened"
                                                : "closed"
                                    }`}
                            ></em>
                        </u>
                    </b>
                    <i></i>
                </span>
            </div>
        </div>
    )
}