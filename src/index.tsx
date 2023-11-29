import { createRoot } from "@mini-react/mini-react-dom";

const root = createRoot(document.getElementById('root') as HTMLElement);
function App() {
  return (
    <div className="app">
      <h1>
        hello mini-react
      </h1>
      <cite>this is mini-react project</cite>
      <div className="content">
        今天是11.25 星期六 晚上22.35
        nice to meet you
      </div>
      <hr />
      <div>
        new paragrph 1
      </div>
      <hr />
      <div>
        new paragrph 2
      </div>
      <hr />
      <div> todo list </div>
      <ul>
        <li>learning ml</li>
        <li>learning react source code</li>
        <li>learing english</li>
        <li>learing fundamentals of compiling</li>
      </ul>
      <hr />
      <p>nice to meet you</p>
      <hr />
      <footer><Concact /></footer>
    </div>
  )
}
function Concact() {
  return <div className="concact">
    <p>
      gamejoye@gmail.com
    </p>
    <p>
      3032535923@qq.com
    </p>
  </div>
}
root.render(
  <App />
)