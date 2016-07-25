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
      selected: [],
      group: "none",
      style: "side",
      curve: "none",
    }
  },

  componentWillMount: function(){
    $.ajax({
        type: "GET",
        url: "ages_for_hist_M&F.csv",
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
  rowClick: function(value) {
    var newSelected = [];

    var found = false;
    this.state.selected.map(function(selection) {
      if(selection.PID == value.PID) {
        found = true;
      }
      else {
        newSelected.push(selection);
      }
    })
    if(found != true) {
      newSelected.push(value);
    }
    this.setState({selected: newSelected});
  },
  groupChange: function(e) {
    this.setState({group: e.currentTarget.value});
  },
  styleChange: function(e) {
    this.setState({style: e.currentTarget.value});
  },
  curveChange: function(e) {
    this.setState({curve: e.currentTarget.value});
  },

  render: function(){
    var state = this.state;
    var rowClick = this.rowClick;
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
    //<input type="radio" name="curve" value="normalRand" checked={this.state.curve == "normalRand"} onChange={this.curveChange} />Normal Random <br />
    return(
      <div>
      <div style={{float: 'left'}} className="table">
        <table>
          <tbody>
          <tr><th>PID</th><th>Age</th><th>Divorces</th><th>Sex</th></tr>
            {tableData.map(function(value,i) {
              var style = {};
              state.selected.map(function(selection) {
                if(value.PID == selection.PID) {
                  style = {backgroundColor: 'red'};
                }
              })
              return (<tr onClick={this.rowClick.bind(this,value)} style={style} key={i}><td>{value.PID}</td><td>{value.age}</td><td>{value.divorces}</td><td>{value.sex}</td></tr>);
            }.bind(this))}
          </tbody>
        </table>
      </div>
        <div style={{float: 'right'}}  className="chart">
          {this.state.data != [] ?<Histogram height={this.state.height} width={this.state.width} data={this.state.data} measurement={"age"} id={"PID"} ticks={this.state.ticks}
            displaySelected={this.displaySelected} pointSelected={this.state.selected} group={this.state.group} multiStyle={this.state.style} curve={this.state.curve}/> : null}
        </div>
        <div style={{clear: 'right', float: 'right'}} className="form">
          <form onSubmit={this.onSubmit}>
            Height: <input type="text" ref="height" defaultValue={this.state.height} /><br/>
            Width: <input type="text" ref="width" defaultValue={this.state.width} /><br/>
            Ticks: <input type="text" ref="ticks" defaultValue={this.state.ticks} /> <br/>
            Group By: <br/><input type="radio" name="group" value="none" checked={this.state.group == "none"} onChange={this.groupChange}/>None <br/>
                      <input type="radio" name="group" value="sex" checked={this.state.group == "sex"} onChange={this.groupChange}/>Sex <br/>
                      <input type="radio" name="group" value="divorces" checked={this.state.group == "divorces"} onChange={this.groupChange}/>Divorces <br/>
            Style: <br/><input type="radio" name="style" value="side" checked={this.state.style == "side"} onChange={this.styleChange} />Side-by-Side <br />
                        <input type="radio" name="style" value="stacked" checked={this.state.style == "stacked"} onChange={this.styleChange} />Stacked <br />
                        <input type="radio" name="style" value="100" checked={this.state.style == "100"} onChange={this.styleChange} />100% Stacked <br />
            Curve: <br/><input type="radio" name="curve" value="none" checked={this.state.curve == "none"} onChange={this.curveChange} />None <br />
                        <input type="radio" name="curve" value="normalPdf" checked={this.state.curve == "normalPdf"} onChange={this.curveChange} />Normal PDF <br />
                        <input type="radio" name="curve" value="log" checked={this.state.curve == "log"} onChange={this.curveChange} />Log-Normal PDF <br />
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    )
  }
});

ReactDOM.render(<HistogramApp />, app);
