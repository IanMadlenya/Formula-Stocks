import React from 'react'
import Screenshot from './Suggestions.jpg'
import './whatIsIt.css'

const WhatIsIt = () => (
  <section className="what-is-it section">
    <h2 className="title">What is it?</h2>
    <div className="divider"/>
    <div className="beside">
      <div className="left">
        <img className="screenshot" src={Screenshot} alt="suggestions screenshot"/>
      </div>
      <div className="right">
        <p>
          We offer weekly stock recommendations: what stocks to buy, at what price, how much of it to buy,
          and when to sell them again<br/><br/>

          Use it to better your investment performance, as these recommendations offer something unusual:
          higher expected reward along with a lower expected risk.<br/><br/>

          Using Formula Stocks is easy, too. After logging in you will find purchase and sales suggestions for stocks trading on
          all US stock exchanges including large international stocks. These can be traded from anywhere in the world, through any
          bank or broker you already use.<br/><br/>

          You can use these suggestions individually or choose to replicate our model portfolio. Simply
          follow the instructions, and you will be handling your own account in no time at all.
        </p>
      </div>
    </div>
  </section>
)

export default WhatIsIt
