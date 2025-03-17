import WebSocketForm from "./components/webSocketForm";
import Taxi from "./components/App";
import { useSocketIp } from "./hooks/useSocketIp";

const App: React.FC = () => {
    const { ip, setIp } = useSocketIp();

    return (
        <div>
            {!ip ? (
                <WebSocketForm onConnect={setIp} />
            ) : (
                <Taxi />
            )}
        </div>
    );
};

export default App;