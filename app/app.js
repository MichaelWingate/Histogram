var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var $ = require('jquery');
var Histogram = require('./components/Histogram');

var HistogramApp = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      height: 800,
      width: 800,
      ticks: 10,
      ids: [],
    }
  },

  componentWillMount: function(){
    $.ajax({
        type: "GET",
        url: "ages_for_hist.csv",
        dataType: "text",
        async: false,
        success: function(allText) {
          var allTextLines = allText.split(/\r\n|\n/);
          var headers = allTextLines[0].split(',');
          var lines = [];

          for (var i=1; i<allTextLines.length; i++) {
              var data = allTextLines[i].split(',');
              if (data.length == headers.length) {

                  var tarr = {};
                  for (var j=0; j<headers.length; j++) {
                      tarr[headers[j]] = data[j];
                  }
                  lines.push(tarr);
              }
          }
          this.setState({data: lines})
        }.bind(this)
     });
  },
  onSubmit: function(event) {
    event.preventDefault();
    var height = Number(ReactDOM.findDOMNode(this.refs.height).value);
    var width = Number(ReactDOM.findDOMNode(this.refs.width).value);
    var ticks = Number(ReactDOM.findDOMNode(this.refs.ticks).value);

    this.setState({
      height: height,
      width: width,
      ticks: ticks,
    });
  },
  displaySelected: function(ids) {
    this.setState({ids: ids});
  },

  render: function(){
    var state = this.state;
    if(this.state.ids.length == 0) {
      var tableData = this.state.data;
    }
    else {
      var tableData = this.state.data.filter(function(value) {
        value.PID
        var found = false;
        state.ids.map(function(id) {
          if(value.PID == id) {
            found = true;
          }
        })
        return found;
      });
    }
    return(
      <div>
        <div className="chart">
          {this.state.data != [] ?<Histogram height={this.state.height} width={this.state.width} data={this.state.data} measurement={"age"} id={"PID"} ticks={this.state.ticks}
            displaySelected={this.displaySelected}/> : null}
        </div>
        <div className="form">
          <form onSubmit={this.onSubmit}>
            Height: <input type="text" ref="height" defaultValue={this.state.height} /><br/>
            Width: <input type="text" ref="width" defaultValue={this.state.width} /><br/>
            Ticks: <input type="text" ref="ticks" defaultValue={this.state.ticks} /> <br/>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div className="table">
          <table>
            <tbody>
            <tr><th>PID</th><th>Age</th><th>Divorces</th></tr>
              {tableData.map(function(value,i) {
                return <tr key={i}><td>{value.PID}</td><td>{value.age}</td><td>{value.divorces}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
});

ReactDOM.render(<HistogramApp />, app);
