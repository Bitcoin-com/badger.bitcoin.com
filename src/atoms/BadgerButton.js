// @flow
import * as React from 'react'
import styled from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import Text from '../atoms/Text'

const BButton = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 50px;
  border: 2px solid ${props => props.theme.brand};
  padding: 10px 25px;
  color: ${props => props.theme.brandDark};
  &:hover {
    background-color: ${props => props.theme.brand};
    color: ${props => props.theme.bg};
  }
`

const Loader = styled.div`
  height: 20px;
  width: 75%;
  background-color: ${props => props.theme.fg100};
  border-radius: 10px;
  display: flex;
  overflow: hidden;
`

const CompleteCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.brand};
  color: ${props => props.theme.bg};
`

const FillerDiv = styled.div`
  width: ${props => props.width}%;
  background-color: ${props => props.theme.brand};
  transition: 3s all ease;
`

const Small = styled.span`
  font-size: 12px;
  font-weight: 700;
`

// Pending State filler
type PropsFiller = {}
type StateFiller = { width: number }

class Filler extends React.Component<PropsFiller, StateFiller> {
  constructor(props) {
    super(props)
    this.state = { width: 1 }
  }
  componentDidMount() {
    setTimeout(() => this.setState({ width: 100 }), 250)
  }
  render() {
    const { width } = this.state
    return <FillerDiv width={width} />
  }
}

// Currency endpoints, logic, and formatters
type CurrencyCode = 'USD' | 'CAD' | 'HKD' | 'JPY' | 'GBP' | 'EUR' | 'CNY'

const buildPriceEndpoint = (currency: CurrencyCode) => {
  return `https://index-api.bitcoin.com/api/v0/cash/price/${currency}`
}

const getCurrencyPreSymbol = (currency: CurrencyCode) => {
  switch (currency) {
    case 'USD':
    case 'CAD':
      return '$'
    case 'GBP':
      return '£'
    case 'EUR':
      return '€'
    case 'HKD':
      return 'HK$'
    case 'JPY':
      return '¥'
    default:
      return ''
  }
}

const getCurrencyPostSymbol = (currency: CurrencyCode) => {
  switch (currency) {
    case 'CNY':
      return '元'
    default:
      return ''
  }
}

const formatPriceDisplay = (price: number) => {
  if (price >= 1) {
    if (price % 1 === 0) {
      // Over 1 no decimal, use whole number
      return price.toFixed(0)
    }
    // Over 1 decimal, show 2 decimals
    return price.toFixed(2)
  }
  // Under 1 show first 2 largest occupied decimals
  return price.toPrecision(2)
}

// Main Badger Button
type Props = {
  to: string,
  text?: string,
  price: number,
  currency: CurrencyCode,
  children?: React.Node,

  successFn: Function,
  failFn?: Function,
}
type State = {
  step: 'fresh' | 'pending' | 'complete',
  BCHPrice: {
    [currency: CurrencyCode]: {
      price: ?number,
      stamp: ?number,
    },
  },
}

class BadgerButton extends React.Component<Props, State> {
  static defaultProps = {
    currency: 'USD',
  }

  constructor(props: Props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      step: 'fresh',
      BCHPrice: {},
    }

    this.updateBCHPrice = this.updateBCHPrice.bind(this)
  }

  componentDidMount() {
    const currency: CurrencyCode = this.props.currency

    // Get price on load, and update price every minute
    this.updateBCHPrice(currency)
    setInterval(() => this.updateBCHPrice(currency), 1000 * 60)
  }

  async updateBCHPrice(currency: CurrencyCode) {
    const priceRequest = await fetch(buildPriceEndpoint(currency))
    const result = await priceRequest.json()

    const { price, stamp } = result
    this.setState({
      BCHPrice: { [currency]: { price, stamp } },
    })
  }

  handleClick() {
    const { to, successFn, failFn, currency, price } = this.props
    const { BCHPrice } = this.state

    const priceInCurrency = BCHPrice[currency].price
    if (!priceInCurrency) {
      this.updateBCHPrice(currency)
      return
    }

    const singleDollarValue = priceInCurrency / 100
    const singleDollarSatoshis = 100000000 / singleDollarValue
    const satoshis = price * singleDollarSatoshis

    if (window && typeof window.Web4Bch !== 'undefined') {
      const { web4bch } = window
      const web4bch2 = new window.Web4Bch(web4bch.currentProvider)

      const txParams = {
        to,
        from: web4bch2.bch.defaultAccount,
        value: satoshis,
      }

      this.setState({ step: 'pending' })

      web4bch2.bch.sendTransaction(txParams, (err, res) => {
        if (err) {
          console.log('BadgerButton send cancel', err)
          failFn && failFn(err)
          this.setState({ step: 'fresh' })
        } else {
          console.log('BadgerButton send success:', res)
          successFn(res)
          this.setState({ step: 'complete' })
        }
      })
    } else {
      window.open('https://badger.bitcoin.com')
    }
  }

  render() {
    const { step, BCHPrice } = this.state
    const { text, price, currency, children } = this.props

    const priceInCurrency = BCHPrice[currency] && BCHPrice[currency].price

    let satoshiDisplay = '----'
    if (priceInCurrency) {
      const singleDollarValue = priceInCurrency / 100
      const singleDollarSatoshis = 100000000 / singleDollarValue
      satoshiDisplay = Math.trunc(price * singleDollarSatoshis)
    }

    if (step === 'fresh') {
      return (
        <BButton onClick={this.handleClick}>
          {children || <Text style={{ lineHeight: '1.3em' }}>{text}</Text>}
          <Text style={{ lineHeight: '1.2em' }}>
            {getCurrencyPreSymbol(currency)} {formatPriceDisplay(price)}
            {getCurrencyPostSymbol(currency)} <Small> {currency}</Small>
          </Text>
        </BButton>
      )
    }
    if (step === 'pending') {
      return (
        <Loader>
          <Filler />
        </Loader>
      )
    }
    if (step === 'complete') {
      return (
        <CompleteCircle>
          <FontAwesomeIcon icon={faCheck} />
        </CompleteCircle>
      )
    }
    return <div>State not found</div>
  }
}

export default BadgerButton
