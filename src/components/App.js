import {connect} from 'react-redux';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import BoxHelper from '../Helper/BoxHelper';
import PageHeader from './Home/PageHeader';
import TableHeader from './Home/TableHeader';
import GroupRow from './Home/GroupRow/GroupRow';
import $ from 'jquery';
import 'react-perfect-scrollbar/dist/css/styles.css';
import CreateGroup from './Home/Create Group/CreateGroup';
let moment = require('moment');

class App extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      Groups:[]
    };
  }
  componentDidMount() 
  {
    BoxHelper.OnReadyJqueryFunctions();    
    BoxHelper.IsTokenAvailable().then(data => {
      BoxHelper.adminClient = new BoxHelper.Box.BasicBoxClient({ accessToken: BoxHelper.adminToken });
      BoxHelper.userClient = new BoxHelper.Box.BasicBoxClient({ accessToken: BoxHelper.adminToken });
      BoxHelper.GetAdminUser().then(user=>{
        BoxHelper.userName = user;
        this.GetUserGroupCollection(user);
      });
    });
  }

  GetUserGroupCollection(userName)
  {
    BoxHelper.GetUserId(userName).then(user =>{
      if(user.login === userName && user.status === 'active')
      {
        BoxHelper.GetGroupMembershipsOfUser(user.id,"0","20").then(memberships=>{
          if(memberships.length > 0)
          {
            $.each(memberships,(membershipIndex,membership)=>{
              BoxHelper.GetGroupInfo(membership.group.id).then(groupInfo=>{
                let dt = moment(groupInfo.created_at);
                let groupPosition = this.state.Groups.length;
                if(membership.role === 'admin')
                {
                  this.AddGroupInfo(groupPosition,membership.group.name,groupInfo.description, membership.group.id, membership.id, membership.role,dt.format("DD MMM YYYY"), groupInfo.invitability_level);
                }
              });
            });
          }
        });
      }
    });
  }

  AddGroupInfo(rowId, groupName, groupDesc, groupId, membershipId, role, groupCreatedDate, groupInviteLevel)
  {
    let reactHandler = this;
    reactHandler.state.Groups.slice();
    let arrayvar = reactHandler.state.Groups.slice();
    arrayvar.push({"groupIndex": rowId,"groupName":groupName,"groupDesc":groupDesc,
                   "groupId":groupId,"membershipId":membershipId,"role":role,
                   "groupCreatedDate":groupCreatedDate,
                   "groupInviteLevel":groupInviteLevel});
    this.setState({Groups:arrayvar});
  }

  render() {
    return (
      <div className="container bxPageWrapper">
        <PageHeader />
        <TableHeader />
        <div className="slimScrollDiv" style={{"marginLeft":"15px","position": "relative", "overflow": "hidden", "width": "auto", "height": "750px"}}>
          <div className="panel-group bxDashboardAccordion" id="accordion" style={{"overflow": "hidden", "width": "auto", "height": "750px"}}>
              <Scrollbars style={{ height: 750 }} autoHide autoHideDuration={200} autoHideTimeout={1000}>
              {this.state.Groups.map(function(item,key)
                {
                  return <GroupRow groupInfo = {item} key={key}/>;
                },this)
              }</Scrollbars>
          </div>
        </div>
        <CreateGroup/>
      </div>
    );
  }
}
export default (App);
