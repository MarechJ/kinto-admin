import React from "react";
import { takeEvery } from "redux-saga";
import { put } from "redux-saga/effects";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import "whatwg-fetch";
import { generate } from "generate-password";


/* Clean up remains of test plugin */
const PLUGIN_ACTION_REQUEST = "PLUGIN_ACTION_REQUEST";
const PLUGIN_ACTION_SUCCESS = "PLUGIN_ACTION_SUCCESS";
//const PASSWORD_API_URL = process.env.PASSWORD_API ? process.env.ENV : ''

const PASSWORD_API = process.env.PASSWORD_API;

// Test actions
function testActionRequest() {
  return { type: PLUGIN_ACTION_REQUEST };
}

function testActionSuccess() {
  return { type: PLUGIN_ACTION_SUCCESS, answer: 42 };
}

// Container setup
function mapStateToProps(state) {
  return { plugin: state.plugin };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ testActionRequest }, dispatch);
}

// Plugin view root container component
class TestPlugin extends React.Component {
    /* This thing should probably be split in several component. */
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

        const pass = generate({
            length: 32,
            numbers: true,
            symbols: true,
            exclude: ' "<>#%{}|\^~[]`;/?:@=&'
        });
        this.setState({password: pass, principal: "", password_error: false});
        return false;
    }

    handleChange(event) {
        this.setState({password: event.target.value, password_error: false});
        return false;
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
                    <input placeholder="password" type="text" className="form-control" onFocus={this.handleFocus}  value={this.state.password} onChange={this.handleChange}/>
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
/*
The plugin API is/was undocumented at the time of coding so I did not touch the unlcear part.
If you know what you are doing please fix/remove the test plugin remains
 */

const TestPluginContainer = connect(mapStateToProps, mapDispatchToProps)(
  TestPlugin
);

// Test saga
function* testSaga(getState, action) {
  yield new Promise(r => setTimeout(r, 1000));
  yield put(testActionSuccess(42));
}

// Plugin exports
// If you change the path change it in the SideBar as well it's hardcoded there.
const routes = [
    {path: "/plugin/passgen", name: "generator", components: {content: TestPluginContainer}}
];

export const sagas = [[takeEvery, PLUGIN_ACTION_REQUEST, testSaga]];

export const reducers = {
  plugin(state = { answer: 0 }, action) {
    switch (action.type) {
      case PLUGIN_ACTION_SUCCESS: {
        return { ...state, answer: action.answer };
      }
      default: {
        return state;
      }
    }
  },
};

export function register(store) {
  return {
    routes,
  };
}
