import { useState } from "react"
import TaxiWithSunroof from "./taxi-with-sunroof"
import { Button } from "./ui/button"
import { Lock, LockOpenIcon } from "lucide-react"

export default function App() {
    const [sunroofState, setSunroofState] = useState<"closed" | "opening" | "closing" | "opened">("closed")

    const handleOpenSunroof = () => {
        if (sunroofState === "closed" || sunroofState === "closing") {
            setSunroofState("opening")
        }
    }

    const handleCloseSunroof = () => {
        if (sunroofState === "opened" || sunroofState === "opening") {
            setSunroofState("closing")
        }
    }

    const handleAnimationEnd = () => {
        if (sunroofState === "opening") {
            setSunroofState("opened")
        } else if (sunroofState === "closing") {
            setSunroofState("closed")
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#ededed] p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-center mb-4">Sunroof Control</h1>
                <div className="flex gap-4 justify-center">
                    <Button
                        size={"lg"}
                        onClick={handleOpenSunroof}
                        disabled={sunroofState === "opening" || sunroofState === "opened"}
                        className="bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <LockOpenIcon />
                        Abrir
                    </Button>
                    <Button
                        size={"lg"}
                        onClick={handleCloseSunroof}
                        disabled={sunroofState === "closing" || sunroofState === "closed"}
                        className="bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Lock />
                        Cerrar
                    </Button>
                </div>
            </div>

            <TaxiWithSunroof sunroofState={sunroofState} onAnimationEnd={handleAnimationEnd} />
        </main>
    )
}