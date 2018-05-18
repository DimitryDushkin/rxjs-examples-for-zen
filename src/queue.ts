import { Observable, Subject, of, empty, Subscriber, throwError } from "rxjs";
import {
  flatMap,
  delay,
  tap,
  concatMap,
  retry,
  retryWhen,
  catchError,
  take,
} from "rxjs/operators";
import { log } from "./utils";

class Api {
  public requestFeed() {
    let errorCounter = 2;
    return of("feed response").pipe(
      delay(300),
      flatMap(response => {
        log("Api: try to fetch feed response");

        if (--errorCounter === 0) {
          return of(response);
        } else {
          return throwError(new Error("feed request thrown error"));
        }
      })
    );
  }
  public sendStats() {
    return of("stats").pipe(delay(100));
  }
}


const RETRIES = 2;
const RETRY_DELAY = 100;
class Queue {
  private queue: Subject<any>;

  constructor() {
    this.queue = new Subject();

    this.queue
      .pipe(
        concatMap((o: Observable<any>) => o) // Keep observables execution in queue
      )
      .subscribe(); // Start the magic (actually start to execute observables one by one from queue)
  }

  public push(qeuedObservable: Observable<any>) {
    return Observable.create((observer: Subscriber<any>) => {
      const newObservable = qeuedObservable.pipe(
        //   retry(RETRIES),
        // retryWhen(errors =>
        //   errors.pipe(delay(RETRY_DELAY), take(RETRIES))
        // ), 
        // "Listen" for next or error if retry fails (side-effect free)
        tap(observer), 
        // Catch error if retry fails to not fail the whole queue
        catchError(() => empty()));  
      
      this.queue.next(newObservable);

      return newObservable;
    });
  }
}

const api = new Api();
const queue = new Queue();

queue
  .push(api.requestFeed())
  .subscribe(
    (result: any) => log("feed request result", result),
    (err: any) => log("feed request error", err),
  );

queue
  .push(api.sendStats())
  .subscribe(
    (result: any) => log("send stats result", result),
    (err: any) => log("send stats error", err)
  );
