import React from 'react'

const BrowserPieChart = React.createClass({
  render () {
    var config = {
      "type": "pie",
      "dataProvider": [{
        "title": this.props.title,
        "value": this.props.value,
      }, {
        "title": "",
        "value": this.props.max,
      } ],
      "titleField": "title",
      "valueField": "value",
      "radius": "40%",
      "innerRadius": "70%",
      labelsEnabled: false,
      colors: ['#27A5F9', '#F3F3F3']
    };

    return (
      <div className="browserChart">
        {React.createElement(AmCharts.React, config)}
        <h3>{this.props.title}</h3>
      </div>
    )
  }
})

export default BrowserPieChart
