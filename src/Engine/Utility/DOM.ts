import { Observable } from 'rxjs/Observable';

export function onceEvent<T extends Event>(node: Node,
                                           eventName: string): Promise<T> {
  return new Promise<T>(resolve =>
    node.addEventListener(eventName, e => resolve(<T>e)));
}

/**
 * Notice!!
 * If a node have no parent node, subscriber will never call complete.
 */
export function observeEvent<T extends Event>(node: EventTarget,
                                              eventName: string): Observable<T> {
  return new Observable(subscriber => {
    node.addEventListener(eventName, e => subscriber.next(<T>e));

    const parentNode: Node|null = (<Node>node).parentNode;

    if (parentNode) {
      const observer = new MutationObserver((records: MutationRecord[]) => {
        const shouldComplete = records
          .reduce((prev: Node[], curr: MutationRecord) => prev.concat(listToArray<Node>(curr.removedNodes)), [])
          .some(removeedNode => removeedNode === node);
        if (shouldComplete) {
          subscriber.complete();
        }
      });
      observer.observe(parentNode, { childList: true });
    }
  });
}

/**
 * To describe any list-like object from browser.
 */
interface ListOf<T> {
  readonly length: number;
  item(index: number): T;
  [index: number]: T;
}

export function listToArray<T>(list: ListOf<T>): T[] {
  return Array.prototype.slice.call(list);
}