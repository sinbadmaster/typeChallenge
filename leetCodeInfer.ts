interface Action<T> {
  payload?: T;
  type: string;
}

class EffectModule {
  count = 1;
  message = "hello!";

  delay(input: Promise<number>) {
    return input.then((i) => ({
      payload: `hello ${i}!`,
      type: "delay"
    }));
  }

  setMessage(action: Action<Date>) {
    return {
      payload: action.payload!.getMilliseconds(),
      type: "set-message"
    };
  }
}

type PickFnName<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

type UseInfer<T> = T extends (action: Action<infer K>) => Action<infer U>
  ? (action: K) => Action<U>
  : T;

type NoPromise<T> = T extends (
  input: Promise<infer K>
) => Promise<Action<infer U>>
  ? (input: K) => Action<U>
  : T;

// 修改 Connect 的类型，让 connected 的类型变成预期的类型
type Connect = (
  module: EffectModule
) => {
    [K in PickFnName<EffectModule>]: NoPromise<UseInfer<EffectModule[K]>>;
  };

const connect: Connect = (m) => ({
  delay: (input: number) => ({
    type: "delay",
    payload: `hello 2`
  }),
  setMessage: (input: Date) => ({
    type: "set-message",
    payload: input.getMilliseconds()
  })
});

type Connected = {
  delay(input: number): Action<string>;
  setMessage(action: Date): Action<number>;
};

export const connected: Connected = connect(new EffectModule());
