import React from 'react'
// bare minimum to use tea-cup
import { Program } from 'react-tea-cup'
import { Cmd, Dispatcher, Sub } from 'tea-cup-core'

// a Model can be anything. Here, it's simply a number...
type Model = number

// the Messages can be modeled in various ways. Here we choose
// discriminated union types.
type Msg = { type: 'INCREMENT' } | { type: 'DECREMENT' }

// init is called once, at application startup, and returns the
// initial model, as well as commands if any.
function init(): [Model, Cmd<Msg>] {
  return [
    0, // initial model
    Cmd.none(), // no initial commands
  ]
}

// view function takes the model, and returns a React node (TSX).
// It also needs the dispatcher function, so that
// the view can dispatch messages.
function view(dispatch: Dispatcher<Msg>, model: Model) {
  return (
    <div>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <span>value = {model}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  )
}

// update function : handle the messages and return a [model, cmd] pair
function update(msg: Msg, model: Model): [Model, Cmd<Msg>] {
  switch (msg.type) {
    case 'INCREMENT':
      return [model + 1, Cmd.none()]
    case 'DECREMENT':
      return [model - 1, Cmd.none()]
  }
}

// subs : return the subscriptions for the model, evaluated at every update.
function subscriptions(model: Model): Sub<Msg> {
  return Sub.none() // no subs in this example
}

// App is a functional React component that delegates to <Program/>
// Program is where the whole wiring is done.
const App = () => (
  <Program
    init={init}
    view={view}
    update={update}
    subscriptions={subscriptions}
  />
)

export default App
