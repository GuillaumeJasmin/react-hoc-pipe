/* global jest, describe, it, expect, global */

import React from 'react'
import enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { pipe, pipeRequest } from '../src/index'

enzyme.configure({ adapter: new Adapter() })

describe('pipe', () => {
  it('should render Component', () => {
    const Component = jest.fn(() => null)
    const App = pipe().render(Component)
    mount(<App />)
    expect(Component).toBeCalled()
  })

  const Component = props => (
    <div>
      {props.x}-{props.y}-{props.z}
    </div>
  )

  const hocs = {
    addData: options => data => {
      options.addDataValue = data
    },
    request: options => data => App => props => (
      <App {...props} {...data} {...options.addDataValue} />
    ),
    transformProps: () => () => App => props => (
      <App
        x={`transform__${props.x}`}
        y={`transform__${props.y}`}
        z={`transform__${props.z}`}
      />
    ),
  }

  it('should render HOC and Component and transform data', () => {
    const App = pipe(hocs)
      .request({ x: 'xValue' })
      .addData({ y: 'yValue' })
      .transformProps()
      .render(Component)

    const wrapper = mount(<App z="zValue" />)
    expect(wrapper.html()).toEqual(
      '<div>transform__xValue-transform__yValue-transform__zValue</div>',
    )
  })

  it('should render HOC and Component and transform with different order', () => {
    const App = pipe(hocs)
      .transformProps()
      .request({ x: 'xValue' })
      .addData({ y: 'yValue' })
      .render(Component)

    const wrapper = mount(<App z="zValue" />)
    expect(wrapper.html()).toEqual('<div>xValue-yValue-transform__zValue</div>')
  })

  it('shloud throw an error', () => {
    expect(() => pipe({ render: {} })).toThrow(
      'actions render is a already defined',
    )
  })
})

describe('pipeRequest', () => {
  it('should render Component', () => {
    const Component = jest.fn(() => null)
    const Loader = jest.fn(() => null)
    const App = pipeRequest()
      .request(() => Promise.resolve(true))
      .renderLoader(Loader)
      .render(Component)

    const wrapper = mount(<App />)

    expect(Loader).toBeCalled()

    return Promise.resolve(wrapper).then(() => {
      expect(Component).toBeCalled()
    })
  })

  it('should render Component with correct props', () => {
    const Component = props => <div>{props.y}</div>
    const App = pipeRequest()
      .request(() => Promise.resolve({ x: 'x' }))
      .mapRequestToProps(props => ({ y: `${props.x}-y` }))
      .render(Component)

    const wrapper = mount(<App />)

    return Promise.resolve(wrapper).then(() => {
      expect(wrapper.html()).toEqual('<div>x-y</div>')
    })
  })
})
