import { Action, State } from "./types/types";


 declare const ContractError: new (arg0: string) => any; 
  
  // Define the available functions
  const functions: { [key: string]: (state: State, action: Action) => { state: State } } = {
    click
  };
  
  // The handle function that processes the action
  export function handle(state: State, action: Action): { state: State } {
    if (Object.keys(functions).includes(action.input.function)) {
      return functions[action.input.function](state, action);
    }
    throw new ContractError(`function not defined!`);
  }
  
  // The click function that increments the click count
  function click(state: State, action: Action): { state: State } {
    state.clicks = state.clicks + 1;
    return { state };
  }
  