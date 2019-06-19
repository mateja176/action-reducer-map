import { Action, AnyAction, Reducer } from 'redux';

interface PayloadAction<Type, Payload> extends Action<Type> {
  payload: Payload;
}

type AnyPayloadAction = PayloadAction<string, any>;

type GenericReducer = Reducer<{}, AnyAction>;

interface ActionReducerMap {
  [key: string]: GenericReducer;
}

type CreateAction<Type> = () => Action<Type>;
type CreatePayloadAction<Type, Payload> = (
  payload: Payload,
) => PayloadAction<Type, Payload>;

type CreateActionCreator = <Type>(type: Type) => CreateAction<Type>;

const createActionCreator: CreateActionCreator = type => () => ({ type });

type CreatePayloadActionCreator = <Type, Payload>(
  type: Type,
) => CreatePayloadAction<Type, Payload>;

const createPayloadActionCreator: CreatePayloadActionCreator = type => payload => ({
  type,
  payload,
});

interface SliceConfig<ARM extends ActionReducerMap> {
  reducers: ARM;
}

interface Slice<R extends GenericReducer, A extends { [type: string]: any }> {
  reducer: R;
  actions: A;
}

const createSlice = <ARM extends ActionReducerMap>({
  reducers,
}: SliceConfig<ARM>) => {
  type StateAndActions = Parameters<ARM[keyof ARM]>;

  type SliceReducer = Reducer<StateAndActions['0'], StateAndActions['1']>;

  const reducer: SliceReducer = (state, action) =>
    reducers[action.type](state, action);

  type Reducers = typeof reducers;

  type SliceActions = {
    [type in keyof Reducers]: Parameters<
      Reducers[type]
    >['1'] extends AnyPayloadAction
      ? CreatePayloadAction<
          Parameters<Reducers[type]>['1']['type'],
          Parameters<Reducers[type]>['1']['payload']
        >
      : CreateAction<Parameters<Reducers[type]>['1']['type']>
  };

  const slice: Slice<SliceReducer, SliceActions> = {
    reducer,
    actions: Object.keys(reducers).reduce(
      // TODO add ternary
      (actions, type) => ({ ...actions, [type]: () => ({ type }) }),
      {} as SliceActions,
    ),
  };

  return slice;
};

const {
  reducer,
  actions: { increment, decrementBy },
} = createSlice<{
  increment: Reducer<number, Action<'increment'>>;
  decrementBy: Reducer<number, PayloadAction<'decrementBy', number>>;
}>({
  reducers: {
    increment: state => state + 1,
    decrementBy: (state, { payload }) => state + payload,
  },
});

const incrementAction = increment();

const {
  reducer: reducer1,
  actions: { increment: increment1, decrementBy: decrementBy1 },
} = createSlice({
  reducers: {
    increment: (state: number, action: Action<'increment'>) => state + 1,
    decrementBy: (
      state: number,
      { payload }: PayloadAction<'decrement', number>,
    ) => state + payload,
  },
});
