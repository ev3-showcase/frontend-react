import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { Container,Row,Col,Button } from 'reactstrap';
import clamp from 'lodash-es/clamp'
import { useSpring, animated } from 'react-spring'
import { useGesture } from 'react-with-gesture'

const DEBUG_PRINT = false;
const API_MQTTMSG_URL = "http://api-server-fk-sc.aotp012.mcs-paas.io/api/v1/publish/message";

function Joystick() {
    const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }))
    const bind = useGesture(({ down, delta, velocity }) => {
        velocity = clamp(velocity, 1, 8)
        set({ xy: down ? delta : [0, 0], config: { mass: velocity, tension: 500 * velocity, friction: 50 } })
    })
    return <animated.div {...bind()} style={{ transform: xy.interpolate((x, y) => `translate3d(${x}px,${y}px,0)`) }} />
}


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carSpeed: 0,
            carSteering: 0,
            APISuccess:0,
            APIFailed:0
        };

    }

    postUpdateToApi = () => {
        let carData = {speed:this.state.carSpeed,steering:this.state.carSteering}
        axios.post(API_MQTTMSG_URL, carData, {headers: {'Content-Type': 'application/json'}})
            .then(res => {
                if(DEBUG_PRINT){
                    console.log(res);
                    console.log(res.data);
                }
                this.setState({APISuccess : this.state.APISuccess+1})
            })
            .catch(error => {
                this.setState({APIFailed : this.state.APIFailed+1});
                if(DEBUG_PRINT){
                    console.log(error.response)
                }
            });
    };

    //reset car values
    emergencyBreak = () => {
        this.setState({
            carSpeed: 0,
            carSteering: 0
        }, () => this.postUpdateToApi())
    };

    //handle car speed form events
    handleCarSpeed = (event) => {
        this.setState({
            carSpeed: event.target.value
        },() => this.postUpdateToApi())
    };

    //handle car steering form events
    handleCarSteering = (event) => {
        this.setState({
            carSteering: event.target.value
        },() => this.postUpdateToApi())
    };

    startRequestFloodWith = (numberOfRequests) => {
        this.setState({
            carSpeed: 0,
            carSteering: 0
        },() => {
            for (let i = 0; i < numberOfRequests; i++) {
                this.postUpdateToApi()
            }
        })
    };

    render(){
        return (
            <div className="App">

                <Container style={{height:"50vh", backgroundColor:"#eee"}} className={"joystickContainer"}>

                    <Joystick/>

                </Container>


                <Container style={{height:"50vh"}}>
                    <Row>
                        <Col>
                            <p>Success API requests: {this.state.APISuccess}</p>
                            <p>Failed API requests: {this.state.APIFailed}</p>
                        </Col>
                        <Col>
                            <p>Speed is: <b>{this.state.carSpeed}%</b></p>
                            <input
                                id="speedInput"
                                type="range"
                                min="-100" max="100"
                                value={this.state.carSpeed}
                                onChange={this.handleCarSpeed}
                                step="1"/>
                        </Col>
                        <Col>
                            <p>Steering is: <b>{this.state.carSteering}°</b></p>
                            <input
                                id="steeringInput"
                                type="range"
                                min="-100" max="100"
                                value={this.state.carSteering}
                                onChange={this.handleCarSteering}
                                step="1"/>
                        </Col>
                        <Col>
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
                        </Col>
                    </Row>
                </Container>



            </div>
        );

    }

}

export default App;
