# React Pipe Request

Simplify the remote request handling on a React app, with a chain of HOC, and simplify their reusage.

- [Simple example](#simple-example)
- [Documentation](#documentation)
- [Integration with externals HOC](#Integration-with-externals-HOC)
  - [redux connect()](#HOC-with-arguments-like-redux-connect)
  - [withRouter()](#HOC-without-arguments-like-withRouter)
- [Reuse custom pipeRequest](#Reuse-custom-pipeRequest)

# Simple example

```js
import React from 'react'
import { pipeRequest } from 'react-pipe-request'

class MyComponent extends React.Component {
  ...
}

const App = pipeRequest()
  .request((props) => fetch('http://website.com/posts'))
  .mapRequestProps((response) => ({ posts: response.posts }))
  .renderLoader(() => <div>Loading...</div>)
  .render(MyComponent)
```

# Documentation

```js
import { pipeRequest } from 'react-pipe-request'

const externalsHOC = {
  ...
}

const App = pipeRequest(externalsHOC)
  /**
   * async request. Must return a Promise
   *
   * optional
   */
  .request(props => fetch('...'))

  /**
   * map the request results to props
   *
   * optional
   */
  .mapRequestToProps(response => ({
    foo: response.bar,
  }))

  /**
   * Functionnal component or class component
   *
   * It's render during the request process
   * If there is no renderLoader, final render is use
   *
   * optional
   */
  .renderLoader(() => <div>is Loading...</div>)

  /**
   * Functionnal component or class component
   * Final render
   *
   * required
   */
  .render(props => <div>...</div>)
  // or
  .render(Component)
```

# Integration with externals HOC

You can, and you should, use externals HOC with `pipeRequest`. Following examples are made with 2 common HOC, but you can of course use any others HOC.

- [HOC with arguments, like redux connect()](#HOC-with-arguments-like-redux-connect)
- [HOC without arguments, like withRouter()](#HOC-without-arguments-like-withRouter)

## HOC with arguments, like redux connect()

```js
import { pipeRequest } from 'react-pipe-request'
import { connect } from 'react-redux'

const App = pipeRequest({ connect })
  .connect(
    mapStateToProps,
    mapDispatchToProps,
  )
  .request(...)
  .mapRequestProps(...)
  .renderLoader(...)
  .render(props => <div>...</div>)
```

You can also use only your externals HOC, without use the request

```js
const App = pipeRequest({ connect })
  .connect(mapStateToProps, mapDispatchToProps))
  .render((props) => <div>...</div>)
```

## HOC without arguments, like withRouter()

If you use externals HOC without argument, like `withRouter()`, the syntaxe is a bit different than HOC with arguments, like `connect()` .

connect: `connect(params)(App)`

withRouter: `withRouter(App)`

As you can see, `connect()` take params and return another function, while `withRouter()` directly take the React component as parameter. So the externals HOC config is a bit different:

```js
import { pipeRequest } from 'react-pipe-request'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

const App = pipeRequest({ connect, withRouter: () => withRouter })
  .connect(
    mapStateToProps,
    mapDispatchToProps,
  )
  .request(props => fetch('...'))
  .withRouter()
  .render(props => <div>...</div>)
```

# Reuse custom pipeRequest

You can, and you should, create your own pipeRequest and reuse it across your application.

This is usefull, because you always use the same HOC, and always show the same loader.

```js
import { pipeRequest } from 'react-pipe-request'
import { connect } from 'reat-redux'

export const myCustomPipeRequest = (hocs) => {
  return pipeRequest({ connect, ...hocs })
    .renderLoader(() => (
      <div>Loading...</div>
    ))
}

...

const App = myCustomPipeRequest()
  .connect(...)
  .request(...)
  .render(...)
```
