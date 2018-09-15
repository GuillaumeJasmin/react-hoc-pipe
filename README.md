# React Render Pipe

Chain, setup and reuse [High Order Components](https://reactjs.org/docs/higher-order-components.html) easily accross your React application.

## Motivation

On a React project, you often use the same [HOC](https://reactjs.org/docs/higher-order-components.html), with sometimes the same arguments. `renderPipe()` enable to create a pipe of HOC, and reuse it accross your application.

A predefined render pipe, named `renderPipeRequest`, is also provided. You can create your own renderPipe, or use renderPipeRequest and extends it with your HOCs.

Do you want to see a concrete example now? See [render pipe request](#rende-pipe-request) or a [full reusable render pipe](#full-reusable-render-pipe)

---

- [Render Pipe Documention](#render-pipe)

  - [How to create a renderPipe](#how-to-create-a-renderpipe-)
  - [How to define HOCs](#how-to-define-hoc-)
  - [What are externals params ?](#what-are-externalsparams-)

- [Real world examples](#real-world-examples)
  - [RendePipeRequest](#rende-pipe-request)
  - [HOC with arguments, like redux connect(mapStateToProps, mapDispatchToProps)](#hoc-with-arguments-like-redux-connect-)
  - [HOC without arguments, like React Router withRouter()](#hoc-without-arguments-like-withrouter-)
  - [Enhance redux connect() with externals params](#enhance-redux-connect-with-externals-params)
  - [Full reusable render pipe](#full-reusable-render-pipe)

# Render Pipe

`renderPipe()` is a reusable pipe of HOC.

## How to create a renderPipe ?

```js
const hocs = {
  myFirstHOC: { ... }
  mySecondHOC: { ... }
}

const myRenderPipe = () => renderPipe(hocs)
```

Then, reuse it !

```js
class Component extends React.Component {
  ...
}

const App = myRenderPipe()
  .myFirstHOC(params)
  .mySecondHOC()
  .render(Component)

...

render() {
  return <App />
}
```

## How to define HOC ?

```js
const hocs = {
  withData: {
    externalsParams: [],
    HOC: externalsParams => data => App => {
      return class Request extends React.Component {
        render() {
          return <App {...this.props} {...data} />
        }
      }
    },
  },
}
```

- `externalsParams` - optional - functions to set parameters that will be used inside HOC. [More detail](#what-is-externalsparams-)

- `data` - optional - yours HOC arguments

- `App` - React Component

Full example:

```js
const hocs = {
  withData: {
    externalsParams: [],
    HOC: (externalsParams) => (data) => App => {
      return class Request extends React.Component {
        render() {
          return <App {...this.props} {...data} />
        }
      }
    },
  }
}

const myRenderPipe = () => renderPipe(hocs)

...

const App = myRenderPipe()
  .withData({ foo: 'bar' })
  .render((props) => {
    return <div>{props.foo}</dib>
  })
```

I know, this example is completely useless. But it's simple. You can then build your complex HOC.

## What are `externalsParams` ?

`externalsParams` are functions to set parameters that will be used inside HOC. It's usefull because you can set paramters before or after the HOC call in the pipe.

```js
const hocs = {
  withData: {
    externalsParams: ['addData']
    HOC: (externalsParams) => (data) => App => {
      return class Request extends React.Component {
        render() {
          // addData[0] correspond to the first argument of addData()
          const externalsData = externalsParams.addData[0];

          return <App {...this.props} {...data} {...externalsData} />
        }
      }
    },
  }
}

const myRenderPipe = () => renderPipe(hocs)

...

const App = myRenderPipe()
  .withData({ foo: 'bar' })
  .addData({ foo2: 'bar2' })
  .render((props) => {
    return <div>{props.foo} {props.foo2}</dib>
  })
```

"_Wait, why do not simply use only `withData()` and pass all data through it_" :question:

Good question ! And the anwser is simple: sometimes, you want to reuse a renderPipe, with the same parameter 95% of the time, and 5% remaining, you want to override it.

Example:

```js
const hocs = {
  request: {
    externalsParams: ['renderLoader'],
    HOC: ...,
  }
}

const Loader = () => <div>...</div>

const myRenderPipe = () => renderPipe(hocs).renderLoader(Loader)

...

const Page1 = myRenderPipe()
  .request(...)
  .render(...)

...

const Page2 = myRenderPipe()
  .request(...)
  .render(...)
```

You defined your spinner only once, and it will be use into all of your `myRenderPipe()`, until you override it. If you want to override it for a specific component, it's simple:

```js
const Page1 = myRenderPipe()
  .request(..)
  .renderLoader(() => <div>Loading...</div>)
  .render(...)
```

:warning: externals params doesn't care about the call order. Externals parameters can be call before or after his HOC. Both `Page1` and `Page2` are equivalent:

```js
const Page1 = myRenderPipe()
  .request()
  .renderLoader()
  .render()

const Page2 = myRenderPipe()
  .renderLoader()
  .request()
  .render()
```

However, the call order of HOC is important !

`Page1` and `Page2` are not the same:

```js
const Page1 = myRenderPipe()
  .connect(...)
  .request(...)
  .render(Component)

const Page2 = myRenderPipe()
  .request()
  .connect()
  .render(Component)
```

The classique HOC syntax correspond to this:

```js
const Page1 = connect(...)(request(...)(Component))

const Page2 = request(...)(connect(...)(Component))
```

# Real world examples

Do you want a full real usefull example ? Well. I made a render pipe focus on the request handling.

## Rende Pipe Request

`renderPipeRequest()` is a predefined render pipe, focus on the request feature. It makes it possible to perform a request, show a loader, map request results to props, and then render your component,

```js
import React from 'react'
import { renderPipeRequest } from 'react-render-pipe'

class MyComponent extends React.Component {
  ...
}

const App = renderPipeRequest()
  .request((props) => fetch('http://website.com/posts'))
  .mapRequestToProps((response) => ({ posts: response.posts }))
  .renderLoader(() => <div>Loading...</div>)
  .render(MyComponent)
```

Just above, the documentation of `renderPipeRequest()`

```js
import { renderPipeRequest } from 'react-render-pipe'

/**
 * hocs are optional
 */
const hocs = {
  ...
}

const App = renderPipeRequest(hocs)
  /**
   * async request. Must return a Promise
   *
   * optional
   */
  .request(props => fetch('...'))

  /**
   * map the request results to props
   *
   * By default, request results are not sent as props to the render()
   * Because sometime, you doesn't want to get the results directly.
   * It's the case if you use redux actions with dispatch. You perform a request,
   * but don't want to get the result from the Promise
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
  .render(Component)
```

## HOC with arguments, like redux connect()

Here, I will use `renderPipeRequest()`, but if you doesn't need request handling, you can use `renderPipe()`

```js
import { renderPipeRequest } from 'react-render-pipe'
import { connect } from 'react-redux'

const hocs = {
  connect: {
    HOC: (externalsParams) => (mapStateToProps, mapDispatchToProps) => App => {
      return connect(mapStateToProps, mapDispatchToProps)(App);
    },
    // Or the simpler and shorter version
    HOC: (externalsParams) => connect
  }
}

const App = renderPipeRequest({ connect })
  .connect(
    mapStateToProps,
    mapDispatchToProps,
  )
  .request(...)
  .mapRequestProps(...)
  .renderLoader(...)
  .render(props => <div>...</div>)
```

## HOC without arguments, like withRouter()

If you use externals HOC without argument, like `withRouter()`, the syntaxe is a bit different than HOC with arguments, like `connect()` .

connect: `connect(params)(App)`

withRouter: `withRouter(App)`

As you can see, `connect()` take params and return another function, while `withRouter()` directly take the React component as parameter. So the externals HOC config is a bit different.

Note: in the following examples, `externalsParams` are useless.

```js
import { renderPipeRequest } from 'react-render-pipe'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

const hocs = {
  connect: {
    HOC: (externalsParams) => connect
  }
  withRouter: {
    HOC: (externalsParams) => () => withRouter
  }
}

const App = renderPipeRequest(hocs)
  .connect(
    mapStateToProps,
    mapDispatchToProps,
  )
  .request(props => fetch('...'))
  .withRouter()
  .render(props => <div>...</div>)
```

## Enhance redux connect() with externals params

externals params can be usefull for defined `mapDispatchToProps`, if you often use the same actions.

```js
import { renderPipeRequest } from 'react-render-pipe'
import { connect } from 'react-redux'
import { fetchUser } from 'src/store/actions'

const hocs = {
  connect: {
    externalsParams: ['mapDispatchToProps']
    HOC: (externalsParams) => (mapStateToProps, mapDispatchToProps) => {
      const finalMapDispatchToProps = externalsParams.mapDispatchToProps || mapDispatchToProps
      return connect(mapStateToProps, finalMapDispatchToProps)
    }
  }
}

const myRenderPipeRequest = () => renderPipeRequest(hocs).mapDispatchToProps({ fetchUser })

...

const App = myRenderPipeRequest()
  .connect(mapStateToProps)
  .request(props => props.fetchUser()) // fetchUser is binded to redux store
  .render(props => <div>...</div>)
```

## Full reusable render pipe

```js
import { renderPipeRequest } from 'react-render-pipe'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchUser } from 'src/store/actions'

const hocs = {
  connect: {
    HOC: () => connect,
  },
  withRouter: {
    HOC: () => () => withRouter,
  },
}

const renderPipeWithUser = externalsHOCs =>
  renderPipeRequest({ hocs, ...externalsHOCs })
    .withRouter()
    .connect(
      (state, props) => {
        const userId = props.match.params.userId
        return {
          userId,
          user: state.users[userId],
        }
      },
      { fetchUser },
    )
    .request(props => props.fetchUser(userId))
    .renderLoader(() => <div>Fetching user...</div>)
```

Then, reuse it !

```js
const UserView = (props) => (
  <div>
    <div>{props.user.firstName}</div>
    <div>{props.user.lastName}</div>
  </div>
)

const User = renderPipeWithUser().render(UserView)

...

class Page extends React.Component {
  render() {
    return (
      <div>
        <User />
      </div>
    )
  }
}
```
