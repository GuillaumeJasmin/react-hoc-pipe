import React from 'react'

/**
 * compose function taken from recompose package
 * https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js
 */
const compose = (...funcs) =>
  funcs.reduce((a, b) => (...args) => a(b(...args)), arg => arg)

export const pipe = (actions = {}) => {
  const userPipeActions = {}
  const options = {}

  const pipeActions = {
    render: App => {
      const FinalApp = compose(...Object.values(userPipeActions))(App)
      return class RenderPipe extends React.Component {
        render() {
          return <FinalApp {...this.props} />
        }
      }
    },
  }

  Object.entries(actions).forEach(([key, value]) => {
    if (pipeActions[key]) {
      throw new Error(`actions ${key} is a already defined`)
    }

    pipeActions[key] = params => {
      const exec = value(options)(params)

      if (exec !== undefined) {
        userPipeActions[key] = exec
      }

      return pipeActions
    }
  })

  return pipeActions
}

export default {
  pipe,
}
