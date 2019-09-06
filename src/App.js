import React from 'react';
import {
    BrowserView,
    MobileView,
    isBrowser,
    isMobile
} from "react-device-detect";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container,Row,Col } from 'reactstrap';

function App() {
    return (
        <div className="App">
            <BrowserView>
                <Container>
                    <Row>
                        <Col>
                            <p>Is Browser</p>
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

export default App;
