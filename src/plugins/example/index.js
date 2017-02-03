import React from "react";
import { takeEvery } from "redux-saga";
import { put } from "redux-saga/effects";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import "whatwg-fetch";


const PLUGIN_ACTION_REQUEST = "PLUGIN_ACTION_REQUEST";
const PLUGIN_ACTION_SUCCESS = "PLUGIN_ACTION_SUCCESS";
//const PASSWORD_API_URL = process.env.PASSWORD_API ? process.env.ENV : ''

const PASSWORD_API = process.env.PASSWORD_API;

// Test actions
function testActionRequest() {
  return {type: PLUGIN_ACTION_REQUEST};
}

function testActionSuccess() {
  return {type: PLUGIN_ACTION_SUCCESS, answer: 42};
}

// Container setup
function mapStateToProps(state) {
  return {plugin: state.plugin};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({testActionRequest}, dispatch);
}

// Plugin view root container component
class TestPlugin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            password_error: false,
            username: "",
            username_error: false,
            principal: ""
        };
        this.handleChange = this.handleChange.bind(this);
    }

    passwordGenerator() {
        const len = 32;
        let length = (len)?(len):(10);
        let string = "abcdefghijklmnopqrstuvwxyz"; //to upper
        let numeric = '0123456789';
        let punctuation = "$-_.+!*'(),";
        let password = "";
        let character = "";
        let crunch = true;
        while( password.length<length ) {
            let entity1 = Math.ceil(string.length * Math.random()*Math.random());
            let entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
            let entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
            let hold = string.charAt( entity1 );
            hold = (entity1%2==0)?(hold.toUpperCase()):(hold);
            character += hold;
            character += numeric.charAt( entity2 );
            character += punctuation.charAt( entity3 );
            password = character;
        }
        const pass = password;
        this.setState({password: pass, principal: "", password_error: false});
        return false;
    }

    handleChange(event) {
        this.setState({password: event.target.value, password_error: false});
        return fals;
    }

    handleFocus(event) {
        event.target.select();
        return false;
    }

    encrypt() {
        console.log("URL: ", PASSWORD_API);
        let self = this;

        if (!this.state.username) {
            this.setState({username_error: true});
        }
        if (!this.state.password) {
            this.setState({password_error: true});
        }
        if (!this.state.username || !this.state.password) { return false;}
        fetch(PASSWORD_API + '/hmac/' + this.state.username + '/' + this.state.password).then(
            function (response) {
                return response.json();
            }).then(function (json) {
                console.log(json);
                self.setState({principal: json.principal});
            }
        );

        return false;
    }

    render() {
        const {plugin, testActionRequest} = this.props;
        return (
          <div className="panel panel-default">
            <div className="panel-heading">
              <b>Generate a new account and its kinto's principal</b>
            </div>
            <div className="panel-body">


              <div className="row">
                <div className="col-lg-6">
                  <div className={"form-group has-feedback " + (this.state.username_error ? 'has-error' : '')}>
                    <input type="text" className="form-control" placeholder="username" onChange={(e) => this.setState({ username: e.target.value, principal: "", username_error: false })}/>
                    <span className={"glyphicon glyphicon-remove form-control-feedback " + (this.state.username_error ? '' : 'hidden')}></span>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className={"input-group has-feedback " + (this.state.password_error ? 'has-error' : '')}>
                    <span className="input-group-btn">
                      <button className="btn btn-default" onClick={() => this.passwordGenerator()}>Gen password</button>
                    </span>
                    <input placeholder="password" type="text" className="form-control" value={this.state.password} onChange={this.handleChange}/>
                    <span className={"glyphicon glyphicon-remove form-control-feedback " + (this.state.password_error ? '' : 'hidden')}></span>

                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="input-group">
                    <span className="input-group-btn">
                      <button className="btn btn-info" onClick={() => this.encrypt()}>Encrypt</button>
                    </span>
                    <input className="form-control" type="text" readOnly onFocus={this.handleFocus} value={this.state.principal}/>

                  </div>
                  <p className="help-block">Encrypt then Copy this principal and set it in the permission form of the bucket/collection.</p>
                </div>
              </div>
            </div>
          </div>
    );
  }
}

const TestPluginContainer = connect(mapStateToProps, mapDispatchToProps)(TestPlugin);

// Test saga
function* testSaga(getState, action) {
  yield new Promise(r => setTimeout(r, 1000));
  yield put(testActionSuccess(42));
}

// Plugin exports
const routes = [
    {path: "/plugin/passgen", name: "generator", components: {content: TestPluginContainer}}
];

export const sagas = [
  [takeEvery, PLUGIN_ACTION_REQUEST, testSaga]
];

export const reducers = {
  plugin(state = {answer: 0}, action) {
    switch(action.type) {
      case PLUGIN_ACTION_SUCCESS: {
        return {...state, answer: action.answer};
      }
      default: {
        return state;
      }
    }
  }
};

export function register(store) {
  return {
    routes
  };
}
