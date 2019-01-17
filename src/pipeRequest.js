import React from 'react'
import { pipe } from './pipe'

const actions = {
  renderLoader: options => Loader => {
    options.Loader = Loader
  },
  mapRequestToProps: options => mapRequestToProps => {
    options.mapRequestToProps = mapRequestToProps
  },
  request: options => request => App => {
    return class RenderPipeRequest extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          isReady: false,
        }
      }

      componentDidMount() {
        request(this.props).then(res => {
          if (this.isUnmount) return
          this.setState({
            isReady: true,
            data: options.mapRequestToProps
              ? options.mapRequestToProps(res)
              : null,
          })
        })
      }

      componentWillUnmount() {
        this.isUnmount = true
      }

      render() {
        const { isReady, data } = this.state
        const FinalApp = App
        const finalProps = { ...this.props, ...data }
        const Loader = options.Loader || null
        return !isReady && Loader ? (
          <Loader {...finalProps} />
        ) : (
          <FinalApp {...finalProps} />
        )
      }
    }
  },
}

export const pipeRequest = externalsActions =>
  pipe({ ...externalsActions, ...actions })

export default { pipeRequest }
