import { Observable, Observer } from "rxjs";
import {log} from './utils'

const observable = Observable.create((observer: Observer<number>) => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  setTimeout(() => {
    observer.next(4);
    observer.complete();
  }, 1000);
});

log("just before subscribe");
observable.subscribe({
  next: (x: any) => log("got value " + x),
  error: (err: any) => log("something wrong occurred: " + err),
  complete: () => log("done")
});
log("just after subscribe");
