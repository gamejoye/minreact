import { createRoot } from "@mini-react/mini-react-dom";

const root = createRoot(document.getElementById('root') as HTMLElement);
function App() {
  return (
    <div className="app">
      <h1>hello</h1>
      <p>this is mini-react project</p>
      <footer>nice to meet you</footer>
    </div>
  )
}
root.render(<App />)