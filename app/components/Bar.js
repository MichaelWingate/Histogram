var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

var Bar = React.createClass({
  getDefaultProps: function() {
    return({
      yOffset: 0,
    })
  },
  render: function() {
    var yPos = this.props.availableHeight - this.props.height - this.props.yOffset;
    var xPos = this.props.xPos;
    var textX = xPos + (this.props.width/2);
    var textY = yPos + 15;
    var textStyle = {fill: 'white',};
    if (this.props.height < 17) {
      textY = yPos -3;
      textStyle = {fill: `black`,};
    }
    if(this.props.cut){
    var outlinePath = `M  ${xPos-(this.props.width/5)} ${yPos+25} q ${(this.props.width+(2*this.props.width/5))/4} -${this.props.width/5} ${(this.props.width+(2*this.props.width/5))/2} 0 t ${(this.props.width+(2*this.props.width/5))/2} 0 l 0 ${this.props.height/30}
                q ${-(this.props.width+(2*this.props.width/5))/4} ${this.props.width/5} ${-(this.props.width+(2*this.props.width/5))/2} 0 t ${-(this.props.width+(2*this.props.width/5))/2} 0  Z`;
    var borderPath = `M  ${xPos-(this.props.width/5)} ${yPos+25} q ${(this.props.width+(2*this.props.width/5))/4} -${this.props.width/5} ${(this.props.width+(2*this.props.width/5))/2} 0 t ${(this.props.width+(2*this.props.width/5))/2} 0 m 0 ${this.props.height/30}
                q ${-(this.props.width+(2*this.props.width/5))/4} ${this.props.width/5} ${-(this.props.width+(2*this.props.width/5))/2} 0 t ${-(this.props.width+(2*this.props.width/5))/2} 0  `;
  }
    return (
      <g>
        <rect style={this.props.style} onClick={this.onClick} fill={this.props.color} width={this.props.width} height={this.props.height}
        x={xPos} y={yPos}/>
        {this.props.value > 0 ? <text textAnchor="middle" width={this.props.width} style={textStyle} x={textX} y={textY} >{this.props.label}</text>
          : null}
        {this.props.cut ? <path fill="white"  d={outlinePath}/>: null}
        {this.props.cut ? <path fill="none" stroke="black" strokeWidth={2} d={borderPath} /> : null}
      </g>
    );
  }
});

module.exports = Bar;
