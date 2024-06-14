import { useState } from "@minreact/mini-react-reconciler";

export default function App() {
  const [count, setCount] = useState<number>(0);
  function addCount() {
    setCount(count + 1);
    (console as any).logger('click');
  }
  return (
    <div className={`app${count}`}>
      <h1>count: {count}</h1>
      <button onClick={addCount}>add</button>
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
      <footer>{count % 4 === 0 ? (
        <div>
          <h1>count是4的倍数的时候</h1>
          <div>mod 4 === 0</div>
        </div>
      )
        : <Concact />}
      </footer>
      <SlowList />
    </div>
  )
}

function Concact() {
  const [concactCount, setConcactCount] = useState(0);
  function addCount() {
    setConcactCount(concactCount + 1);
  }
  return <div className="concact">
    <p>
      gamejoye@gmail.com
    </p>
    <p>
      3032535923@qq.com
    </p>
    <button onClick={addCount}>{concactCount}</button>
  </div>
}

function SlowList() {
  const items = [];
  for (let i = 0; i < 250; i++) {
    items.push(<SlowItem key={i} value={i} />);
  }
  return <ul>
    {items}
  </ul>
}

function SlowItem({ value }) {
  let startTime = performance.now();
  while (performance.now() - startTime < 1) {
    // 每个 item 暂停 1ms，模拟极其缓慢的代码
  }
  return (
    <li>
      value: {value}
    </li>
  )
}
