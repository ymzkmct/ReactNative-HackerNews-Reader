
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  NavigatorIOS,
  WebView,
} = React;

var RNHackerNews = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.navigator}
        initialRoute={{
          component: RNHackerNewsListView,
          title: "Hack News"
        }}
      />
    );
  }
});

var RNHackerNewsListView = React.createClass({

  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
    }
  },

  componentDidMount: function() {
    this.fetchData();
  },

  fetchData: function() {
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
      .then((response) => response.json())
      .then((res) => {
        return res.slice(0, 20);
      })
      .then((ids) => {
          var promises = ids.map(function(id){
            return fetch("https://hacker-news.firebaseio.com/v0/item/"+id+".json?print=pretty").then((response) => response.json())
          });
          return Promise.all(promises);
      })
      .then((ids) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(ids),
          loaded: true,
        });
      })
      .done();

  },
  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        style={styles.listView}
      />
    );
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>loading....</Text>
      </View>
    );
  },

  renderRow: function(row, sectionID, rowID){
    return (
      <TouchableHighlight onPress={() => this._onPress(row)}>
        <View style={styles.cell}>
          <Text style={styles.title}>{row.title}</Text>
          <Text style={styles.url}>{row.url}</Text>
        </View>
      </TouchableHighlight>
    )
  },

  _onPress: function(row) {
    console.log(row);
    this.props.navigator.push({
      title: row.title,
      component: WebView,
      passProps: {url: row.url}
    });
  }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
  },
  listView: {
  },
  cell: {
    textAlign: 'left',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    backgroundColor: '#F5FCFF',
    fontSize: 20

  },
  title: {
    fontWeight: 'bold',
  },
  url: {
    fontSize: 10,
    color: "#444444",
    paddingLeft: 5,
  },
  navigator: {
    flex: 1
  }
});

AppRegistry.registerComponent('RNHackerNews', () => RNHackerNews);
