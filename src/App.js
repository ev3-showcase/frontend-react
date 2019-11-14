import React from 'react';
import {
    BrowserView,
    MobileView,
    isBrowser,
    isMobile
} from "react-device-detect";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container,Row,Col,Button } from 'reactstrap';

const API_MQTTMSG_URL = "http://api-server-fk-sc.aotp012.mcs-paas.io/api/v1/publish/message";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carSpeed: 0,
            carSteering: 0
        };

    }

    //reset car values
    resetCar = () => {
        this.setState({
            carSpeed: 0,
            carSteering: 0
        })
    }

    //handle car speed form events
    handleCarSpeed = (event) => {
        this.setState({
            carSpeed: event.target.value
        })

        var xhr = new XMLHttpRequest()

        xhr.open('POST', API_MQTTMSG_URL);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ speed: event.target.value }))
    }

    //handle car steering form events
    handleCarSteering = (event) => {
        this.setState({
            carSteering: event.target.value
        })

        var xhr = new XMLHttpRequest()

        xhr.open('POST', API_MQTTMSG_URL);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ steering: event.target.value }))

    }


    startRequestFloodWith = (numberOfRequests) => {

        for (let i = 0; i < numberOfRequests; i++) {
            var xhr = new XMLHttpRequest()
            console.log("flood with: ", i)
            xhr.open('POST', API_MQTTMSG_URL);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ speed: 0 }))
        }


    }



    //subscribe to react state changes and send them to mqtt
    static getDerivedStateFromProps(props, state) {
        console.log(JSON.stringify(state))
    }

    render(){
        return (
        <div className="App">
            <BrowserView >
                <Container>
                    <Row>
                        <Col>
                            <p>Is Browser</p>
                        </Col>
                        <Col>
                            <p>Speed is: <b>{this.state.carSpeed}%</b></p>
                            <input
                                id="speedInput"
                                type="range"
                                min="-90" max="90"
                                value={this.state.carSpeed}
                                onChange={this.handleCarSpeed}
                                step="1"/>
                        </Col>
                        <Col>
                            <p>Steering is: <b>{this.state.carSteering}°</b></p>
                            <input
                                id="steeringInput"
                                type="range"
                                min="-90" max="90"
                                value={this.state.carSteering}
                                onChange={this.handleCarSteering}
                                step="1"/>
                        </Col>
                    </Row>
                </Container>
                <Container>
                    <Row>
                        <Col>
                            <Button onClick={() => this.startRequestFloodWith(100)} >Send 100 Requests</Button>
                        </Col>
                        <Col>
                            <Button onClick={() => this.startRequestFloodWith(1000)} >Send 1.000 Requests</Button>
                        </Col>
                        <Col>
                            <Button onClick={() => this.startRequestFloodWith(10000)} >Send 10.000 Requests</Button>
                        </Col>
                    </Row>
                </Container>
            </BrowserView>
            <MobileView>
                <Container>
                    <Row>
                        <Col>
                            <p>This application is not available for mobile browsers, yet!</p>
                        </Col>
                    </Row>
                </Container>
            </MobileView>
        </div>
    );

    }

}

export default App;
