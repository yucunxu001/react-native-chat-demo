/*
 * @选择好友
 * @Author: huangjun
 * @Date: 2018-10-10 16:29:18
 * @Last Modified by: huangjun
 * @Last Modified time: 2018-10-10 16:39:34
 */
import React from 'react'
import { View, ListView, Image, ScrollView, Dimensions } from 'react-native'
import { Container, Icon, ListItem, Text, Body } from 'native-base'
import { NimTeam, NimFriend } from 'react-native-netease-im'

export default class SelectUsers extends React.Component {
  static navigatorStyle = {
    statusBarTextColorScheme: 'light',
    StatusBarColor: '#444',
    tabBarHidden: true,
    navBarBackgroundColor: '#444',
    navBarButtonColor: '#fff',
    navBarTextColor: '#fff',
  }
  static navigatorButtons = {
    leftButtons: [
      {
        id: 'cancel',
        buttonColor: '#fff',
        title: '取消',
      },
    ],
    rightButtons: [
      {
        id: 'add',
        buttonColor: '#fff',
        title: '确定',
      },
    ],
  }
  // 构造
  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({
      rowHasChanged: () => true,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    })
    this.state = {
      ds: ds.cloneWithRowsAndSections([]),
      selectAccounts: [],
    }
    this.props.navigator.setOnNavigatorEvent(this._onNavigatorEvent.bind(this))
  }
  _onNavigatorEvent(event) {
    const { navigator, teamId } = this.props
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'add') {
        const result = this.getIds()
        if (result.length > 0) {
          NimTeam.addMembers(teamId, result).then(() => {
            this.props.onResult && this.props.onResult()
          })
        }
      }
      if (event.id === 'cancel') {
        navigator.dismissModal()
      }
    }
  }
  getIds() {
    const arr = []
    this.state.selectAccounts.map(res => {
      arr.push(res.contactId)
    })
    return arr
  }
  componentWillMount() {
    NimFriend.getFriendList('').then(data => {
      this.listData = this.formatData(data)
      this.setState({
        ds: this.state.ds.cloneWithRowsAndSections(this.listData),
      })
    })
  }
  formatData = (data) => {
    const newObj = {}
    const h = transform(data).sort()
    h.map(res => {
      newObj[res] = data[res]
    })
    return newObj
  }
  getStatus(data) {
    const { members = [] } = this.props
    let isSelect = false
    members.map(res => {
      if (data.contactId === res.contactId) {
        isSelect = true
      }
    })
    return isSelect
  }
  _select(res, selectId, rowId) {
    const newSelect = this.state.selectAccounts
    if (res.isSelect) {
      console.log(newSelect.indexOf(res))
      newSelect.splice(newSelect.indexOf(res), 1)
    } else {
      newSelect.push(res)
    }
    this.listData[selectId].splice(rowId, 1, {
      ...res,
      isSelect: !res.isSelect,
    })
    this.setState({
      selectAccounts: newSelect,
      ds: this.state.ds.cloneWithRowsAndSections(this.listData),
    })
  }
  _renderSelect() {
    return this.state.selectAccounts.map(res => (
      <Image
        key={res.contactId}
        style={{ width: 35, height: 35, marginRight: 5 }}
        source={
            res.avatar
              ? { uri: res.avatar }
              : require('../images/discuss_logo.png')
          }
      />
    ))
  }
  _renderRow = (res, sectionID, rowId) => {
    if (this.getStatus(res)) {
      return (
        <ListItem key={res.contactId}>
          <Icon
            name="ios-checkmark-circle"
            style={{ color: '#ccc', marginRight: 8 }}
          />
          <Image
            style={{ width: 35, height: 35 }}
            source={
              res.avatar
                ? { uri: res.avatar }
                : require('../images/discuss_logo.png')
            }
          />
          <Body>
            <Text>{res.name}</Text>
          </Body>
        </ListItem>
      )
    }
    return (
      <ListItem
        key={res.contactId}
        onPress={() => this._select(res, sectionID, rowId)}
      >
        <Icon
          name={res.isSelect ? 'ios-checkmark-circle' : 'ios-radio-button-off'}
          style={{ marginRight: 8, color: res.isSelect ? '#d82617' : '#ccc' }}
        />
        <Image
          style={{ width: 35, height: 35 }}
          source={
            res.avatar
              ? { uri: res.avatar }
              : require('../images/discuss_logo.png')
          }
        />
        <Body>
          <Text>{res.name}</Text>
        </Body>
      </ListItem>
    )
  }
  _renderSectionHeader = (sectionData, sectionID) => (
    <ListItem itemDivider>
      <Text>{sectionID}</Text>
    </ListItem>
  )
  render() {
    return (
      <Container style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
        <View
          style={{
            width,
            height: 51,
            backgroundColor: '#fff',
            justifyContent: 'center',
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#c9c9c9',
          }}
        >
          <ScrollView
            horizontal
            style={{ flex: 1 }}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {this._renderSelect()}
          </ScrollView>
        </View>
        <ListView
          style={{ backgroundColor: '#fff' }}
          dataSource={this.state.ds}
          renderRow={this._renderRow}
          enableEmptySections
          removeClippedSubviews
          renderSectionHeader={this._renderSectionHeader}
        />
      </Container>
    )
  }
}
const { width } = Dimensions.get('window')
function transform(obj) {
  const arr = []
  for (const item in obj) {
    arr.push(item)
  }
  arr.sort(mySorter)
  return arr
}
function mySorter(a, b) {
  if (/^\d/.test(a) !== /^\D/.test(b)) return a > b ? 1 : (a = b ? 0 : -1)
  return a > b ? -1 : a == b ? 0 : 1
}
