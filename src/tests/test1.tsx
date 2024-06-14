import { useEffect, useState } from "@minreact/minreact-reconciler";

export default function App() {
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  }
  useEffect(function func1() {
    (console as any).logger('App初始化...');
    return () => {
      (console as any).logger('App unmount...');
    };;
  }, []);
  useEffect(function func2() {
    (console as any).logger('count mount...');
    return () => {
      (console as any).logger('count unmount...');
    };
  }, [count]);
  return (
    <div>
      <div>
        count: {count}
      </div>
      <div>
        {count % 5 === 0 ? <Sub /> : <div>hi</div>}
      </div>
      <button onClick={add}>
        add
      </button>
    </div>
  )
}

function Sub() {
  useEffect(function func1() {
    (console as any).logger('Sub初始化...');
    return () => {
      (console as any).logger('Sub销毁...');
      return undefined
    };
  }, []);
  return (
    <div>
      <div>
        Sub Function
      </div>
      <div>
        <NestedSub />
      </div>
    </div>
  )
}

function NestedSub() {
  useEffect(function func1() {
    (console as any).logger('NestedSub初始化...');
    return () => {
      (console as any).logger('NestedSub销毁...');
      return undefined
    };
  }, []);
  return (
    <div>
      NestedSub
    </div>
  )
}