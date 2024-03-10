import useWebSocket, { ReadyState } from 'react-use-websocket';

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:8787/ws", {
    shouldReconnect: (event) => true,
  })

  const handleClick = () => sendMessage(Math.random().toString())

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      { connectionStatus }
      <button onClick={handleClick}>Send Message</button>
      { lastMessage?.data }
    </>
  )
}

export default App
