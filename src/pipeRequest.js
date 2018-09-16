import React from 'react'
import { pipe } from './pipe'

const actions = {
  request: {
    externalsParams: ['renderLoader', 'mapRequestToProps'],
    HOC: hocs => request => App => {
      return class RenderPipeRequest extends React.Component {
        constructor(props) {
          super(props)
          this.state = {
            isReady: false,
          }
        }

        componentDidMount() {
          request(this.props).then(res => {
            this.setState({
              isReady: true,
              data: hocs.mapRequestToProps
                ? hocs.mapRequestToProps[0](res)
                : null,
            })
          })
        }

        render() {
          const { isReady, data } = this.state
          const FinalApp = App
          const finalProps = { ...this.props, ...data }
          const Loader = hocs.renderLoader ? hocs.renderLoader[0] : null
          return !isReady && Loader ? (
            <Loader {...finalProps} />
          ) : (
            <FinalApp {...finalProps} />
          )
        }
      }
    },
  },
}

export const pipeRequest = externalsActions =>
  pipe({ ...externalsActions, ...actions })

export default { pipeRequest }
