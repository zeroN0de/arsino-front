import { useState, useEffect } from "react";
import Header from "./components/Header";
import InfoChart from "./components/InfoChart";
import WalletConnectionContext from "./WalletConnectionContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Total() {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [price, setPrice] = useState({
    before24HourPrice: "0",
    nowPrice: "0",
    highPrice: "0",
    lowPrice: "0",
  });
  const [pool, setPool] = useState("");
  const [bettingList, setBettingList] = useState([]);
  const [winner, setWinner] = useState({
    height: 0,
    winners: [],
  });
  const [chart, setChart] = useState([]);
  const [newChart, setNewChart] = useState([]);
  const [setting, setSetting] = useState(null);
  useEffect(() => {
    const ws = new WebSocket("wss://amg-backend.runeterra.info");
    setSocket(ws);
    // DB WS
    ws.onopen = () => {
      console.log("EUR/USD Client Connected");
    };
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      const method = data.method;
      console.log("method", method);
      switch (method) {
        case "new_winners":
          const newWinner = data.data;
          setWinner(newWinner);
          break;
        case "price_update":
          const newPrice = data.data;
          console.log("price", newPrice);
          setPrice(newPrice);
          break;
        case "betting_update":
          const newBettingList = data.data;
          setBettingList(newBettingList);
          break;
        case "new_chart":
          const newChart = [data];
          const newChartTS = newChart[0].data.timestamp;
          const newChartOpen = newChart[0].data.open;
          const newChartHigh = newChart[0].data.high;
          const newChartLow = newChart[0].data.low;
          const newChartClose = newChart[0].data.close;
          const newChartId = newChart[0].data.id;
          const newSetupChart = {
            x: newChartTS,
            y: [newChartOpen, newChartHigh, newChartLow, newChartClose],
          };

          setNewChart(newSetupChart);
          console.log("뉴차트셋업", newSetupChart);
          break;
        case "init": {
          const { chart, game, poolBalance, price } = data.data;
          console.log("", data.data);
          setChart(chart);
          setBettingList(game);
          setPool(poolBalance);
          setPrice(price);
          setSetting(true);
          break;
        }
        default:
          break;
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  if (!setting) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {setting && (
        <WalletConnectionContext.Provider value={{ isConnected, setIsConnected }}>
          <Header />
          <InfoChart
            isConnected={isConnected}
            price={price}
            pool={pool}
            bettingList={bettingList}
            winner={winner}
            chart={chart}
            newChart={newChart}
          />
        </WalletConnectionContext.Provider>
      )}
    </div>
  );
}

export default Total;
