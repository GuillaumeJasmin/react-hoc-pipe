import React from 'react'
import { compose } from 'recompose'

export const pipeRequest = externalsHOC => {
  const requests = []
  const externalsHOCBefore = []
  const externalsHOCAfter = []
  const mapRequestToProps = []
  let Loader = null

  const pipeActions = {
    request: fn => {
      requests.push(fn)
      return pipeActions
    },
    mapRequestToProps: fn => {
      if (!requests.length)
        throw new Error(
          'pipeRequest: unable to use mapRequestToProps because there is no request',
        )
      const lastRequest = requests[requests.length - 1]
      if (mapRequestToProps[lastRequest])
        throw new Error(
          'pipeRequest: unable to use mapRequestToProps 2 times because there is already a mapRequestToProps for the last request',
        )
      mapRequestToProps[lastRequest] = fn
      return pipeActions
    },
    renderLoader: App => {
      Loader = App
      return pipeActions
    },
    render: App => {
      class RenderPipe extends React.Component {
        constructor(props) {
          super(props)
          this.state = {
            isReady: !requests.length,
          }
        }

        componentDidMount() {
          if (requests.length) {
            Promise.all(
              requests.map(request =>
                request(this.props).then(res => {
                  /**
                   * If there is a mapRequestToProps associated with the request
                   * we use it
                   */
                  return mapRequestToProps[request]
                    ? mapRequestToProps[request](res)
                    : null
                }),
              ),
            ).then(data => {
              /**
               * data is an array. it's the output of Promise.all()
               * Here, we merge all output into a single object
               */
              this.setState({
                isReady: true,
                data: data.reduce((a, b) => ({ ...a, ...b })),
              })
            })
          }
        }

        render() {
          const { isReady, data } = this.state
          let FinalApp = App
          const finalProps = { ...this.props, ...data }

          if (!isReady && Loader) {
            return <Loader {...finalProps} />
          }

          if (externalsHOCAfter.length) {
            FinalApp = compose(...externalsHOCAfter)(App)
          }

          return <FinalApp {...finalProps} />
        }
      }

      return externalsHOCBefore.length
        ? compose(...externalsHOCBefore)(RenderPipe)
        : RenderPipe
    },
  }

  /**
   * Custom HOC
   */
  Object.entries(externalsHOC).forEach(([name, fn]) => {
    if (pipeActions[name]) {
      throw new Error(`actions ${name} is a already exist`)
    }

    pipeActions[name] = (...args) => {
      if (!requests.length) {
        externalsHOCBefore.push(fn(...args))
      } else {
        externalsHOCAfter.push(fn(...args))
      }
      return pipeActions
    }
  })

  return pipeActions
}

export default {
  pipeRequest,
}
