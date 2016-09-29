import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router'
import Scroll from 'react-scroll'

import Hero from './Hero'
import store from '../../store'

const Header = React.createClass({
  componentDidMount() {
    $(window).scroll(function(){
        if($(window).scrollTop() === 0){
            $("nav").css({
              // "background-color":"rgba(255,255,255,0.2)",
              "background-color":"rgba(255,255,255,0)",
              "border-bottom": `1px solid rgba(230,230,230, 0)`
            });
            $(".nav-link").css({"color":`white`});
            $('#logo').css({"opacity": "0"})
            $('#logo-white').css({"opacity": "1"})
            $(".nav-link").hover(function(e) {
                $(this).css("color",e.type === "mouseenter"?"#49494A":"#fff")
            })
        }
        else if ($(window).scrollTop() < 100) {
            $('nav').css({
              "background-color":`rgba(255, 255, 255, ${$(window).scrollTop() / 100 + 0.2})`,
              "border-bottom": `1px solid rgba(230,230,230, ${$(window).scrollTop() / 100 + 0.2})`
            });
            if ($(window).scrollTop() > 30){
              $(".nav-link").css({"color":`rgba(73, 73, 73, ${$(window).scrollTop() / 50})`});
              $(".nav-link").hover(function(e) {
                  $(this).css("color",e.type === "mouseenter"?"#27A5F9":"#49494A")
              })
              $('#logo').css({"opacity": "1"})
              $('#logo-white').css({"opacity": "0"})
            } else {
              $(".nav-link").css({"color":`white`});
              $('#logo').css({"opacity": "0"})
              $('#logo-white').css({"opacity": "1"})
              $(".nav-link").hover(function(e) {
                  $(this).css("color",e.type === "mouseenter"?"#49494A":"#fff")
              })
            }
        } else {
          $("nav").css({
            "background-color":"white",
            "border-bottom": `1px solid rgba(230,230,230, 1)`
          });
          $(".nav-link").css({"color":`rgba(73, 73, 73, 1)`});
          $('#logo').css({"opacity": "1"})
          $('#logo-white').css({"opacity": "0"})
        }
    })
  },
  render: function() {
    let ScrollLink = Scroll.Link
    let scroll = Scroll.animateScroll

    let navLinks = (
      <div id="nav-links">
        <Link to="/login" id="login-btn" className="nav-link"><i className="fa fa-sign-in" aria-hidden="true"></i> Login</Link>
        <Link to="/signup" id="signup-btn" className="nav-link"><i className="fa fa-user-plus" aria-hidden="true"></i> Signup</Link>
      </div>
    )

    if (localStorage.authtoken) {
      navLinks = (
        <div id="nav-links">
          <Link to="/dashboard" className="nav-link"><i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard</Link>
          <a href="#" id="logout-btn" onClick={store.session.logout.bind(store.session)} className="nav-link"><i className="fa fa-sign-out" aria-hidden="true"></i>Logout</a>
        </div>
      )
    }
    return (
      <header>
        <nav>
          <div className="content">
            <div className="left" onClick={() => {scroll.scrollToTop()}}>
              <div className="logo-container">
                <div id="logo"></div>
                <div id="logo-white"></div>
              </div>
            </div>
            <div className="right">
              <ScrollLink className="nav-link products-link" to="ourProducts" smooth={true} offset={-100} duration={1000}>Products</ScrollLink>
              <ScrollLink className="nav-link pricing-link" to="pricing" smooth={true} offset={-100} duration={1000}>Pricing</ScrollLink>
              <ScrollLink className="nav-link contact-us-link" to="contactUs" smooth={true} offset={-100} duration={1000}>Contact us</ScrollLink>
              {navLinks}
            </div>
          </div>
        </nav>
        <Hero/>
      </header>
    )
  }
})

export default Header
