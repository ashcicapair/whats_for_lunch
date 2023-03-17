import React, {useState, useMemo, useEffect, useRef} from "react";
import './css/style1.css';
import {Form, Container, Col, Row, Stack, ListGroup, Button, CloseButton, } from 'react-bootstrap'
import { GoogleMap, InfoWindow, Marker, DirectionsRenderer, DirectionsService, Autocomplete, } from '@react-google-maps/api';
import {LuckyWheel} from '@lucky-canvas/react'


const defaultRestaurant = {
    location: '',
    placeId: '',
    name: '',
    address: '',
    phoneNumber: 0,
    rating: 0
};
let retryCount = 0;
export default function Map() {
    const center = useMemo(() => ({lat: 23.553118, lng: 121.0211024}),[]);
    const myLucky = useRef();
    const [zoom, setZoom] = useState(8);
    const [currentLocation, setCurrentLocation] = useState({...center});
    const [searchResult, setSearchResult] = useState(null)
    const [currentDestination, setCurrentDestination] = useState({lat:0, lng:0});
    const [selectedRestaurant, setSelectedRestaurant] = useState({...defaultRestaurant});
    const [savedRestaurant, setSavedRestaurant] = useState(() => {
        try {
            const value = JSON.parse(localStorage.getItem('restaurantList'));
            if (value) {
                return value;
            } else {
                return [];
            }
        } catch (err) {
            return err;
        }
    });
    const [directionResponse, setDirectionResponse] = useState(null);
    const [displayWheel, setDisplayWheel] = useState('none');
    const [ types ] = useState(['restaurant']);
    const [ segColors ] = useState(['#fcba03','#6c7d51','#b86837','#43a1cc']);
    const [blocks] = useState([
        { padding: '10px', background: '#fff' }
    ]);
    const [buttons] = useState([
        { radius: '25%', background: '#000' },
        {
          radius: '22%', background: '#fff',
          pointer: false,
          fonts: [{ text:'Spin', top: '-15px', fontColor:'#000', fontSize:'26px' }]
        }
    ]);
    const southWest = new window.google.maps.LatLng(currentLocation.lat - 0.001,  currentLocation.lng - 0.001);
    const northEast = new window.google.maps.LatLng(currentLocation.lat + 0.001, currentLocation.lng + 0.001);
    const bounds = new window.google.maps.LatLngBounds(southWest,northEast );


    const onLoad = (autocomplete) => {
        setSearchResult(autocomplete);
    };
    
    const onPlaceChanged = (drawedRestaurant) => {
        retryCount = 0;
        if (drawedRestaurant) {
            setSelectedRestaurant({
                location: drawedRestaurant.location,
                placeId: drawedRestaurant.place_id,
                name: drawedRestaurant.name,
                address: drawedRestaurant.address,
                phoneNumber: drawedRestaurant.phoneNumber,
                rating: drawedRestaurant.rating
            });
            setCurrentDestination({
                lat: drawedRestaurant.location.lat,
                lng: drawedRestaurant.location.lng
            });
        } else {
            if (searchResult !== null) {
                let place = searchResult.getPlace();
                setSelectedRestaurant({
                    location: place.geometry.location,
                    placeId: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    phoneNumber: place.formatted_phone_number,
                    rating: place.rating
                });
                setCurrentDestination({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            } else {
                console.log('Autocomplete is not loaded yet!');
            };
        };
    };

    const retryDelay = 1000;
    const maxRetryCount = 1;
    const directionsCallback = (response, status) => {
        return new Promise((resolve, reject) => {
            if (status === "OK") {
                setTimeout(() => {
                    retryCount++;
                    if (retryCount <= maxRetryCount) {
                        resolve(setDirectionResponse(response));
                    } else {
                        reject(new Error(`Geocoding failed after ${retryCount} attempts: ${selectedRestaurant.name}`));
                    }
                }, retryDelay);
                
            } else if (status === 'ZERO_RESULTS') {
                return;
            } else {
                reject(new Error(`Geocoding failed: ${JSON.stringify(selectedRestaurant.name)} (${JSON.stringify(response)})`));
            }
        })
    };

    const directionsServiceOption = {
        origin: {lat: currentLocation.lat, lng: currentLocation.lng},
        destination: {lat: currentDestination.lat, lng: currentDestination.lng},
        travelMode: 'WALKING',
    };

    const addToBookmarks = () => {
        let duplicated = savedRestaurant.map((item) => item.placeId).includes(selectedRestaurant.placeId);
        if (!duplicated) {
            savedRestaurant.push(selectedRestaurant);
            localStorage.setItem('restaurantList', JSON.stringify(savedRestaurant));
            setSavedRestaurant([...savedRestaurant]);
        };
    };

    const removeBookmarks = (index) => {
        const storedRestaurant = JSON.parse(localStorage.getItem('restaurantList'));
        let value = storedRestaurant.splice(index,1);
        localStorage.setItem('restaurantList', JSON.stringify(storedRestaurant));
        setSavedRestaurant([...storedRestaurant]);
    };
    
    const closeWheel = () => {
        setDisplayWheel('none');
    };

    const handleDraw = () => {
        setDisplayWheel('block');
        myLucky.current.play()
        setTimeout(() => {
            const index = Math.random() * 6 >> 0
            myLucky.current.stop(index)
        }, 2500)
    };

    const onFinished = (prize) => {
        if (displayWheel === 'block') {
            alert(`今天吃 ${prize.fonts[0].text} !`);
            setDisplayWheel('none');
            const restaurantList = JSON.parse(localStorage.getItem('restaurantList'));
            let drawedRestaurant = restaurantList.find((restaurant) => restaurant.name === prize.fonts[0].text);
            onPlaceChanged(drawedRestaurant);
        };
    };

    useEffect (() => {
        navigator.geolocation.getCurrentPosition((position) => {
            let currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            setCurrentLocation({...currentPosition});
            setZoom(16);
        });
    },[]);

    return (
        <Container fluid direction="horizontal" gap={3} style={{padding:0}}>
            <Row>
                <Col md={6}>
                    <GoogleMap zoom={zoom} center={currentDestination.lat ? currentDestination : currentLocation} mapContainerClassName="mapContainer">
                        <Marker position={currentDestination.lat ? currentDestination : currentLocation}/>
                        {currentDestination.lat && (
                            <DirectionsService
                                options={directionsServiceOption}
                                callback={directionsCallback}
                                onLoad={directionsService => {
                                    console.log('onLoad DirectionsService : ', directionsService)
                                }}
                                onUnmount={directionsService => {
                                    console.log('onUnmount DirectionsService: ', directionsService)
                                }}
                            />
                        )}
                        {directionResponse !== null && (
                            <>
                                <DirectionsRenderer
                                    options={{
                                    directions: directionResponse,
                                    }}
                                    onLoad={directionsRenderer => {
                                        console.log('onLoad DirectionsRenderer: ', directionsRenderer)
                                    }}
                                    onUnmount={directionsRenderer => {
                                        console.log('onUnmount DirectionsRenderer: ', directionsRenderer)
                                    }}
                                />
                                <InfoWindow
                                    position={{lat: currentDestination.lat, lng: currentDestination.lng}}
                                    >
                                    <Stack direction="vertical" style={{padding: 5}}>
                                        <h5>{selectedRestaurant.name}</h5>
                                        <div>地址: {selectedRestaurant.address}</div>
                                        <div>電話: {selectedRestaurant.phoneNumber}</div>
                                        <div>評分: {selectedRestaurant.rating}</div>
                                        <div>步行時間: {directionResponse.routes[0].legs[0].duration.text}</div>
                                    </Stack>
                                </InfoWindow>
                            </>
                        )}
                    </GoogleMap>
                </Col>
                <Col md={6}>
                    <Form>
                        <Form.Group as={Stack} className="m-3" controlId="formPlainRestaurant">
                            <Form.Label sm="2" style={{fontSize: '20px', fontWeight: 'bold'}}>
                                午餐吃什麼
                            </Form.Label>
                            <Col sm="5">
                                {currentLocation.lat && (
                                    <Autocomplete
                                        onLoad={onLoad}
                                        onPlaceChanged={onPlaceChanged}
                                        bounds={bounds}
                                        types={types}
                                        strictBounds='false'
                                    >
                                        <Form.Control type="text" placeholder=""/>
                                    </Autocomplete>
                                )}
                            </Col>
                            <Col sm="3">
                                <Button variant="outline-primary" className="mt-3" onClick={addToBookmarks}>加入我的最愛</Button>
                            </Col>
                            <Col sm="5" className="mt-5" >
                                <Form.Text style={{fontSize: '18px',}}>
                                    我的最愛
                                </Form.Text>
                                {savedRestaurant.length !== 0 && 
                                    <Button id="spinner" variant="outline-primary" className="ms-3" onClick={handleDraw}>抽籤</Button>
                                }
                            </Col>
                            <Col sm="5" className="mt-2" >
                                <ListGroup variant="flush" numbered>
                                    {
                                        savedRestaurant.map((item, index) => (
                                            <ListGroup.Item key={index}>{item.name}
                                                <CloseButton className="ms-2" onClick={() => removeBookmarks(index)} style={{position:'absolute',right:0}}/>
                                            </ListGroup.Item>
                                        ))
                                    }
                                </ListGroup>
                            </Col>
                            
                        </Form.Group>
                    </Form>
                </Col>
                <div onClick={closeWheel} style={{position:'fixed', top:0, left:0, height:'100vh', width:'100vw', backgroundColor:'rgba(0,0,0,0.3)', display: displayWheel}}>
                    <div id="canvas" height='600' width='600' style={{position: 'absolute', top:'50%', left:'50%', transform: `translate(-50%,-50%)`, zIndex:10}}>
                        <LuckyWheel
                            ref={myLucky}
                            width="600px"
                            height="600px"
                            blocks={blocks}
                            prizes={savedRestaurant.map((item, index) => {return {background: segColors[index % 4], fonts: [{text: item.name, top: '30%'}] }})}
                            buttons={buttons}
                            onEnd={(prize) => onFinished(prize)}
                            style={{position: 'absolute',}}
                        />
                    </div>
                </div>
            </Row>
        </Container>
    )
};
