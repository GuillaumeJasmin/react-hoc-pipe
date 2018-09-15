import React from 'react'

/**
 * compose function taken from recompose package
 * https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js
 */
const compose = (...funcs) =>
  funcs.reduce((a, b) => (...args) => a(b(...args)), arg => arg)

export const renderPipe = actions => {
  const userPipeActions = {}

  const pipeActions = {
    render: App => {
      return class RenderPipe extends React.Component {
        render() {
          const FinalApp = compose(
            ...Object.values(userPipeActions)
              .filter(hoc => typeof hoc === 'function')
              .map(hoc => hoc(userPipeActions)),
          )(App)
          return <FinalApp {...this.props} />
        }
      }
    },
  }

  const allFunctions = [
    ...Object.keys(actions),
    ...Object.values(actions)
      .map(action => action.paramsFn)
      .filter(_ => _)
      .reduce((a, b) => [...a, ...b], []),
  ]

  allFunctions.forEach(name => {
    if (pipeActions[name]) {
      throw new Error(`actions ${name} is a already defined`)
    }

    pipeActions[name] = (...args) => {
      const action = actions[name]
      userPipeActions[name] = action
        ? finalUserPipeActions => action.HOC(finalUserPipeActions)(...args)
        : args

      return pipeActions
    }
  })

  return pipeActions
}

export default {
  renderPipe,
}
