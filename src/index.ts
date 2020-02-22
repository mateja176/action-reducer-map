import { Action, Reducer } from 'redux';
import { PayloadAction } from 'typesafe-actions';

type StringAction = Action<string>;

type FilterActionByType<
  A extends StringAction,
  Type extends A['type']
> = A extends Action<Type> ? A : never;

type CreateReducer = <State extends {}>(
  initialState: State,
) => <A extends StringAction>(
  arm: {
    [Type in A['type']]: (
      state: State,
      action: FilterActionByType<A, Type>,
    ) => State;
  },
) => Reducer<State, A>;
const createReducer: CreateReducer = initialState => arm => (
  state = initialState,
  action,
) => arm[action.type](state, action);

type Count = number;
const initialCountState: Count = 0;
const countReducer = createReducer(initialCountState)<
  Action<'increment'> | PayloadAction<'decrement', Count>
>({
  increment: state => state + 1,
  decrement: (state, action) => state - action.payload,
});
