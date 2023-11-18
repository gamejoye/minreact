export function createFiber(
  tag: any,
  pendingProps: any,
  key: any
): any {
  const fiber = new FiberNode(tag, pendingProps, key);
  return fiber;
}

function FiberNode(
  tag: any,
  pendingProps: any,
  key: any,
) {
  this.tag = tag;
  this.key = key;
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.pendingState = null;
  this.memoizedState = null;
  this.return = null;
  this.sibling = null;
  this.child = null;
  this.alternate = null;
  this.stateNode = null;
  this.index = 0;
  this.deletions = null;
}
