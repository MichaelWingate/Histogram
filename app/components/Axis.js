var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

var Axis = React.createClass({
  componentDidMount: function() {
    this.renderAxis();
  },
  componentDidUpdate: function() {
    this.renderAxis();
  },
  renderAxis: function() {
    var axisNode = ReactDOM.findDOMNode(this.refs.axis);
    var labelNode = ReactDOM.findDOMNode(this.refs.label);
    var axis = d3.axisBottom(this.props.scale)
                .ticks(this.props.ticks);
    d3.select(axisNode).call(axis);
  },
  render() {
    var transform=`translate(${this.props.width/2},35)`;
    var text = this.props.label;
    return(
      <g className="axisGroup" transform={this.props.transform} >
        <g className="axis" ref="axis" />
        <g className="axisLabel" ref="label">
          <text textAnchor="middle" transform={transform}>{text}</text>
        </g>
      </g>
    );
  }
});

module.exports = Axis;
