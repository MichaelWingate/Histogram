var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");

function sort(a,b) {
  if(a.bin.length < b.bin.length) {
    return 1;
  }
  if(a.bin.length > b.bin.length) {
    return -1;
  }
  return 0;
}

var Histogram = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    data: React.PropTypes.array.isRequired,
    measurement: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return({
    ticks: 10,
    pointSelected: [],
  })
  },
  render: function() {
    var props = this.props;
    var data = [];
    props.data.map(function(value) {
      var individual = {id: value[props.id],
                        measurement: value[props.measurement]};
      data.push(individual);
    });
    for(var i=0;i<100;i++) {
      data.push({id: i+200,
                 measurement: 15});
    }
    return(
      <HistogramSeries data={data} width={props.width} height={props.height} padding={50} measurement={props.measurement} ticks={props.ticks}
        displaySelected={props.displaySelected} selectedLine={props.pointSelected}/>
    );
  }
});

var HistogramSeries = React.createClass({
  getInitialState: function() {
    return({
      selection: {
        left: 0,
        right: 0,
      },
      areaSelecting: false,
    })
  },
  getDefaultProps: function(){
    return {
      title: "",
      color: "blue",
      selectedLine: [],
    }
  },
  selectBins: function(left, right) {
    this.setState({
      selection: {
        left: left,
        right: right,
      },
      areaSelecting: true,
    });
  },
  unSelectBins: function() {
    this.setState({
      selection: {
        left: 0,
        right: 0,
      },
      areaSelecting: false,
    });
  },
  render: function() {
    var props = this.props;
    var data = props.data;
    var binnedData = [];

    var xScale = d3.scaleLinear()
      .domain([Math.floor(d3.min(data, function(value) {return value.measurement;})/10)*10, Math.ceil(d3.max(data, function(value) {return value.measurement;})/10) * 10])
      .range([props.padding, props.width - props.padding]);

    var lines = props.selectedLine.map(function(selection, i) {
      var p1 = {x: xScale(selection[props.measurement]),
                y: props.height-props.padding};
      var p2 = {x: xScale(selection[props.measurement]),
                y: props.padding};
      return(<g key={i}><line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="black" />
                <text textAnchor="middle" x={p1.x} y={p2.y}>{selection[props.measurement]}</text></g>)
    })

    var leftSelect = xScale.invert(this.state.selection.left);
    var rightSelect = xScale.invert(this.state.selection.right);

    var bins = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(props.ticks))
      .value(function(d) {return d.measurement})
      (data);

    var sortedBins = [];
    var selecting = this.state.areaSelecting;
    var ids = [];
    // NOTE: value.height is the height that will be displayed, value.bin.length is the "true" height/count
    bins.map(function(value,i) {
      var object = {bin: value,
                    height: value.length,
                    index: i,
                    cut: false,
                    selected: false};
      if(selecting){
        if((value.x0 >= leftSelect && value.x0 <= rightSelect) || (value.x1 >= leftSelect && value.x1 <= rightSelect) || (value.x0 <= leftSelect && value.x1 >= rightSelect)){
          object.selected = true;
          value.map(function(object) {
            ids.push(object.id);
          })
        }
      }
      binnedData.push(object);
      sortedBins.push(object);
    });

    sortedBins.sort(sort);
    var maxIndex = sortedBins[0].index;
    if(sortedBins[1].bin.length * 1.5 < sortedBins[0].bin.length) {
      binnedData[maxIndex].height = sortedBins[1].height*1.3;
      binnedData[maxIndex].cut = true;
    }

    var yScale = d3.scaleLinear()
      .domain([0,d3.max(binnedData, function(d) {return d.height;})])
      .range([props.height-props.padding, props.padding]);

    var bars = binnedData.map(function(value, i) {
      // NOTE: value.height is the height that will be displayed, value.bin.length is the "true" height/count
      return(
          <Bar height={props.height - yScale(value.height) - props.padding} value={value.bin.length}
            width={xScale(value.bin.x1) - xScale(value.bin.x0) -1} offset={xScale(value.bin.x1) - xScale(value.bin.x0)}
            availableHeight={props.height} index={i} key={i} totalWidth={props.width} cut={value.cut} color={value.selected ? "red" : props.color} />
          )
    });
    var yTransform = `translate(${props.padding}, 0)`;
    var xTransform = `translate(0, ${props.height - props.padding})`;

    var dataTransform = `translate(${props.padding}, ${-props.padding})`;

    var axisLabel = props.measurement.charAt(0).toUpperCase() + props.measurement.slice(1);
    return(
      <Chart width={props.width} height={props.height} transform={yTransform} padding={props.padding} selectBins={this.selectBins} unSelect={this.unSelectBins} selectedIDs={ids} selectIDs={props.displaySelected}>
        <g transform={dataTransform}>{bars}</g>
        <Axis orient="bottom" scale={xScale} transform={xTransform} width={props.width} height={props.height} label={axisLabel} ticks={props.ticks}/>
        {lines.length != 0 ? <g>{lines}</g> : null}
      </Chart>
    )
  }
});

var Chart = React.createClass({
  getInitialState: function() {
    return{
      moveActive: false,
      firstPoint: {
        x: 0,
        y: 0,
      },
      secondPoint: {
        x: 0,
        y: 0,
      },
    }
  },
  componentDidMount: function() {
    this.setEvents();
  },
  componentDidUpdate: function() {
    this.setEvents();
  },
  setEvents: function() {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    d3.select(svgNode).on("mousedown", this.onMouseDown);
    d3.select(svgNode).on("mousemove", this.onMouseMove);
    d3.select(svgNode).on("mouseup", this.onMouseUp);
  },
  onMouseDown: function(e) {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    var coords = d3.mouse(svgNode);
    this.setState({ moveActive: true,
                    firstPoint: {x:coords[0], y:coords[1]},
                    secondPoint: {x:coords[0], y:coords[1]}});
  },
  onMouseMove: function(e) {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    var coords = d3.mouse(svgNode);
    if(this.state.moveActive) {
      this.setState({secondPoint: {x:coords[0], y:coords[1]}});
      if(this.state.firstPoint.x > this.state.secondPoint.x) {
        var left = this.state.secondPoint.x;
        var right = this.state.firstPoint.x;
      }
      else{
        var left = this.state.firstPoint.x;
        var right = this.state.secondPoint.x;
      }
      this.props.selectBins(left,right);
    }
  },
  onMouseUp: function(e) {
    this.setState({moveActive: false});
    if(this.state.firstPoint.x == this.state.secondPoint.x && this.state.firstPoint.y == this.state.secondPoint.y) {
      this.props.unSelect();
    }
    this.props.selectIDs(this.props.selectedIDs);
  },

//<line x1={0} y1={yPos-6} x2={this.props.width-this.props.padding*2} y2={yPos-6} stroke={"black"} strokeDasharray={"10,10"} transform={this.props.transform} />
  render: function() {
    if( this.state.firstPoint.x > this.state.secondPoint.x) {
      var left = this.state.secondPoint.x;
    }
    else {
      var left = this.state.firstPoint.x;
    }
    if(this.state.firstPoint.y > this.state.secondPoint.y) {
      var top = this.state.secondPoint.y;
    }
    else {
      var top = this.state.firstPoint.y;
    }
    var width = Math.abs(this.state.firstPoint.x - this.state.secondPoint.x);
    var height = Math.abs(this.state.firstPoint.y - this.state.secondPoint.y);
    return(
      <svg ref="svg" width={this.props.width} height={this.props.height} style={{display: 'inline'}} >
      {this.props.children}
      {this.state.moveActive ? <rect x={left} y={top} fillOpacity="0.5" width={width} height={height} fill="#7063FF"/> : null}
      </svg>
    );
  }
});

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

var Bar = React.createClass({
  render: function() {
    var yPos = this.props.availableHeight - this.props.height;
    var xPos = this.props.offset * (this.props.index) +.5;
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
        <rect onClick={this.onClick} fill={this.props.color} width={this.props.width} height={this.props.height}
        x={xPos} y={yPos}/>
        {this.props.value > 0 ? <text textAnchor="middle" width={this.props.width} style={textStyle} x={textX} y={textY} >{this.props.value}</text>
          : null}
        {this.props.cut ? <path fill="white"  d={outlinePath}/>: null}
        {this.props.cut ? <path fill="none" stroke="black" strokeWidth={2} d={borderPath} /> : null}
      </g>
    );
  }
});

module.exports = Histogram;
