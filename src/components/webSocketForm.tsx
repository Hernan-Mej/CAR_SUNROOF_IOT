import { Wifi, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useState } from "react"

interface WebSocketFormProps {
  onConnect: (ip: string) => void
}

const WebSocketForm: React.FC<WebSocketFormProps> = ({ onConnect }) => {
  const [ip, setIp] = useState("")
  const [isWrongIp, setIsWrongIp] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onConnect(ip)
    localStorage.setItem('ip', ip)
  }

const validateIp = (ip: string) => {
    const ipRegex = /^[\d.:]*$/
    return ipRegex.test(ip)
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validateIp(e.target.value)) {
        setIp(e.target.value)
        setIsWrongIp(false)
        return;
    }
    setIsWrongIp(true)
}

  return (
    <div className="min-h-screen bg-[#ededed] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-4xl text-center flex items-center justify-center gap-2">
            <Wifi className="w-12 h-12" />
            Conectar al Servidor
          </CardTitle>
          <CardDescription className="text-center text-2xl">
            Ingresa la dirección IP del servidor WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                value={ip}
                onChange={(e) => handleChange(e)}
                placeholder="Ejemplo: 192.168.1.100:8080"
                className="text-center border-black"
                style={{ fontSize: '1.4rem' }}
                required
              />
                {isWrongIp && (
                    <div className="text-red-500 text-xl">Caracter ingresado no admitido</div>
                )}
            </div>
            <Button type="submit" className="text-xl w-full bg-blue-500 hover:bg-blue-700 text-white">
              Conectar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default WebSocketForm