import { createRoot } from "@minreact/minreact-dom";
import App from "./tests/test1";

const root = createRoot(document.getElementById('root') as HTMLElement);

const or = console.log;
(console as any).logger = or;


root.render(
  <App />
)