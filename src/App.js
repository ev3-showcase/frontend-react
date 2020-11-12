import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import clamp from 'lodash-es/clamp';
import React from 'react';
import { animated, useSpring } from 'react-spring';
import { useGesture } from 'react-with-gesture';
import { Col, Container, Row } from 'reactstrap';
import './index.css';
var d3 = require('d3');
var mqtt = require('mqtt');

const DEBUG_PRINT = false;
const API_MQTTMSG_URL = 'http://api-legoracer.apps.p005.otc.mcs-paas.io/api/v1/publish/message';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      carSpeed: 0,
      carSteering: 0,
      APISuccess: 0,
      APIFailed: 0,
      selectedDevice: 'car-cloudhub',
    };

    this.handleChange = this.handleChange.bind(this);

    var client = mqtt.connect('ws://message-broker-mqtt-websocket-legoracer.apps.p005.otc.mcs-paas.io/mqtt', {
      port: 80,
      protocol: 'mqtt',
    });

    client.on('connect', function () {
      client.subscribe('stats/lidar', function (err) {
        console.log(err);
      });
    });

    client.on('message', function (topic, message) {
      // message is Buffer
      if (topic === 'stats/lidar') {
      }
      // console.log(topic + ':' + message.toString());
      // client.end();
    });
  }

  postUpdateToApi = () => {
    let carData = {
      id: this.state.selectedDevice,
      speed: this.state.carSpeed,
      steering: this.state.carSteering,
    };
    axios
      .post(API_MQTTMSG_URL, carData, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (DEBUG_PRINT) {
          console.log(res);
          console.log(res.data);
        }
        this.setState({ APISuccess: this.state.APISuccess + 1 });
      })
      .catch((error) => {
        this.setState({ APIFailed: this.state.APIFailed + 1 });
        if (DEBUG_PRINT) {
          console.log(error.response);
        }
      });
  };

  //reset car values
  emergencyBreak = () => {
    this.setState(
      {
        carSpeed: 0,
        carSteering: 0,
      },
      () => this.postUpdateToApi()
    );
  };

  //handle car speed form events
  handleCarSpeed = (event) => {
    this.setState(
      {
        carSpeed: event.target.value,
      },
      () => this.postUpdateToApi()
    );
  };

  //handle car steering form events
  handleCarSteering = (event) => {
    this.setState(
      {
        carSteering: event.target.value,
      },
      () => this.postUpdateToApi()
    );
  };

  startRequestFloodWith = (numberOfRequests) => {
    this.setState(
      {
        carSpeed: 0,
        carSteering: 0,
      },
      () => {
        for (let i = 0; i < numberOfRequests; i++) {
          this.postUpdateToApi();
        }
      }
    );
  };

  updateStateFromChild = (content) => {
    if (content.speed !== this.state.carSpeed || content.steering !== this.state.carSteering) {
      if (DEBUG_PRINT) {
        console.log(content);
      }
      this.setState(
        this.setState(
          {
            carSpeed: content.speed,
            carSteering: content.steering,
          },
          () => this.postUpdateToApi()
        )
      );
    }
  };

  handleChange(event) {
    this.setState({ selectedDevice: event.target.value });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} className="App">
        <Container style={{ height: '50%' }}>
          <Row>
            <select value={this.state.selectedDevice} onChange={this.handleChange}>
              <option value="car-bdsp">BDSP Car</option>
              <option value="car-cloudhub">CloudHub Car</option>
            </select>
          </Row>
          <Row>
            <Col>
              <p>Success API requests: {this.state.APISuccess}</p>
              <p>Failed API requests: {this.state.APIFailed}</p>
            </Col>
            <Col>
              <p>
                Speed is: <b>{this.state.carSpeed}%</b>
              </p>
              <input
                id="speedInput"
                type="range"
                min="-100"
                max="100"
                value={this.state.carSpeed}
                onChange={this.handleCarSpeed}
                step="1"
              />
            </Col>
            <Col>
              <p>
                Steering is: <b>{this.state.carSteering}°</b>
              </p>
              <input
                id="steeringInput"
                type="range"
                min="-100"
                max="100"
                value={this.state.carSteering}
                onChange={this.handleCarSteering}
                step="1"
              />
            </Col>
            {/* <Col>
                            <Row>
                                <Col>
                                    <Button style={{width:"100%"}} onClick={() => this.startRequestFloodWith(100)} >Send 100 Requests</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button style={{width:"100%"}} onClick={() => this.startRequestFloodWith(1000)} >Send 1.000 Requests</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button style={{width:"100%"}} onClick={() => this.startRequestFloodWith(10000)} >Send 10.000 Requests</Button>
                                </Col>
                            </Row>
                        </Col> */}
          </Row>
        </Container>
        <Container fluid={true} style={{ height: '50%', backgroundColor: '#eee' }} className={'joystickContainer'}>
          <Joystick returnToParent={(content) => this.updateStateFromChild(content)} />
        </Container>
      </div>
    );
  }
}

export default App;

function Joystick(props) {
  const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }));
  const bind = useGesture(({ down, delta, velocity }) => {
    velocity = clamp(velocity, 1, 8);
    set({ xy: down ? delta : [0, 0], config: { mass: velocity, tension: 500 * velocity, friction: 50 } });
    const yValue = Math.round(100 * (-1 * ((delta[1] * 4) / window.innerHeight)));
    const xValue = Math.round(100 * ((delta[0] * 2) / window.innerWidth));
    if (down) {
      //console.log({speed:yValue,steering:xValue})
      props.returnToParent({ speed: yValue, steering: xValue });
    } else {
      props.returnToParent({ speed: 0, steering: 0 });
      //console.log("STOP CAR!")
    }
  });
  return <animated.div {...bind()} style={{ transform: xy.interpolate((x, y) => `translate3d(${x}px,${y}px,0)`) }} />;
}
