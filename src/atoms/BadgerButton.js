// @flow
import React from 'react'
import styled from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import Text from '../atoms/Text'

const BButton = styled.button`
  cursor: pointer;
  border: none;
  background-color: ${props => props.theme.brand};
  border-radius: 50px;
  padding: 15px 25px;
  color: ${props => props.theme.bg};
  &:hover {
    background-color: ${props => props.theme.brandDark};
  }
`

const Loader = styled.div`
  height: 20px;
  width: 75%;
  background-color: ${props => props.theme.fg300};
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
    return <FillerDiv width={this.state.width} />
  }
}

type Props = {
  to: string,
  successFn: Function,
  failFn: Function,
  satoshis: number,
}
type State = { step: 'fresh' | 'pending' | 'complete' }

class BadgerButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      step: 'fresh',
    }
  }

  handleClick() {
    const { to, satoshis, successFn, failFn } = this.props
    if (window && typeof window.Web4Bch !== 'undefined') {
      let { web4bch } = window
      let web4bch2 = new window.Web4Bch(web4bch.currentProvider)

      let txParams = {
        to,
        from: web4bch.bch.defaultAccount,
        value: satoshis,
      }
      // parent.classList.add("clicked");

      this.setState({ step: 'pending' })

      web4bch.bch.sendTransaction(txParams, (err, res) => {
        if (err) {
          console.log('send err', err)
          failFn(err)
          this.setState({ step: 'fresh' })
        } else {
          console.log('send success:', res)
          console.log(res)
          successFn(res)
          this.setState({ step: 'complete' })
          // let paywallId = badgerButton.getAttribute("data-paywall-id")
          // if (paywallId) {
          //   let free = document.getElementById("free")
          //   let paywall = document.getElementById("paywall")
          //   free.style.display = "none"
          //   paywall.style.display = "block"
          // }
          // parent.classList.add("success")
          // let successCallback = badgerButton.getAttribute("data-success-callback")
          // if (successFn) {
          //   successFn(res)
          // window[successCallback](res)
        }
      })
    } else {
      window.open('https://badgerwallet.cash')
    }
  }

  render() {
    const { to, successFn, failFn, satoshis } = this.props
    const { step } = this.state
    if (step === 'fresh') {
      return (
        <>
          {/* <div id="free"> */}
          {/* <ButtonWrapper> */}
          <BButton onClick={this.handleClick}>
            <Text>Purchase for 1/3rd of $0.01</Text>
            <div className="fill" />
            <div className="fa fa-check" />
          </BButton>
          {/* </ButtonWrapper> */}
          {/* </div> */}
          {/* <div id="paywall" style={{ display: 'none' }}>
            <h5>Thank you for purchasing!</h5>
            <p>
              <img src="img/bch_logo.svg" className="c-image--cover" />
            </p>
          </div> */}
        </>
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
    return <div>no step found</div>
    // return (
    //   <>
    //     {/* <div id="free"> */}
    //       {/* <ButtonWrapper> */}
    //         <BButton
    //           onClick={this.handleClick}
    //         >
    //           <Text>Purchase for 1/3rd of $0.01</Text>
    //           <div className="fill" />
    //           <div className="fa fa-check" />
    //         </BButton>
    //         {/* </ButtonWrapper> */}
    //     {/* </div> */}
    //     {/* <div id="paywall" style={{ display: 'none' }}>
    //       <h5>Thank you for purchasing!</h5>
    //       <p>
    //         <img src="img/bch_logo.svg" className="c-image--cover" />
    //       </p>
    //     </div> */}
    //   </>
    // )
  }
}

export default BadgerButton
