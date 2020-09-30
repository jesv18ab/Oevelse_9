import * as React from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import {Accuracy} from "expo-location";

export default class App extends React.Component {
  mapViewRef = React.createRef();

  state = {
    //Undersøger om der er tilladelse til lokation
    hasLocationPermission: null,
    //Ser på brugerens nuværende lokaltion
    currentLocation: null,
    //Ser på de fastsatte markers fra brugeren
    userMarkerCoordinates: [],
    //Ser på koordinaten af den valgte markør
    selectedCoordinate: null,
    //Finder adressen å den valgte markør
    selectedAddress: null,
  };

  getLocationPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    this.setState({ hasLocationPermission: status });
  };

  componentDidMount = async () => {
    await this.getLocationPermission();
  };

  updateLocation = async () => {
    const { coords } = await Location.getCurrentPositionAsync({accuracy: Accuracy.Balanced});
    this.setState({ currentLocation: coords });
  };
// Event handler når der laves et long press. Sker når vi sætter en ny markør med et koordinatsæt, der skal tilføjes de
  handleLongPress = event => {
    const { coordinate } = event.nativeEvent;
    this.setState(prevState => {
      return {
        userMarkerCoordinates: [...prevState.userMarkerCoordinates, coordinate],
      };
    });
  };

  handleSelectMarker = coordinate => {
    this.setState({ selectedCoordinate: coordinate });
    this.findAddress(coordinate);
  };

  findAddress = async coordinate => {
    const [selectedAddress] = await Location.reverseGeocodeAsync(coordinate);
    this.setState({ selectedAddress });
  };

  closeInfoBox = () =>
      this.setState({ selectedCoordinate: null, selectedAddress: null });

  renderCurrentLocation = () => {
    const { hasLocationPermission, currentLocation } = this.state;
    if (hasLocationPermission === null) {
      return null;
    }
    if (hasLocationPermission === false) {
      return <Text>No location access. Go to settings to change</Text>;
    }
    return (
        <View>
          <Button title="update location" onPress={this.updateLocation} />
          {currentLocation && (
              <Text>
                {`${currentLocation.latitude}, ${
                    currentLocation.longitude
                } ${currentLocation.accuracy}`}
              </Text>
          )}
        </View>
    );
  };

  render() {
    const {userMarkerCoordinates, selectedCoordinate, selectedAddress,
    } = this.state;
    return (
        <SafeAreaView style={styles.container}>
          {this.renderCurrentLocation()}
          <MapView
              provider="google"
              style={styles.map}
              ref={this.mapViewRef}
              showsUserLocation
              onLongPress={this.handleLongPress}>
            <Marker
                coordinate={{ latitude: 55.676195, longitude: 12.569419 }}
                title="Rådhuspladsen"
                description="blablabal"
            />
            <Marker
                coordinate={{ latitude: 55.673035, longitude: 12.568756 }}
                title="Tivoli"
                description="blablabal"
            />
            <Marker
                coordinate={{ latitude: 55.674082, longitude: 12.598108 }}
                title="Christiania"
                description="blablabal"
            />
            {userMarkerCoordinates.map((coordinate, index) => (
                <Marker
                    coordinate={coordinate}
                    key={index.toString()}
                    onPress={() => this.handleSelectMarker(coordinate)}
                />
            ))}
          </MapView>
          {selectedCoordinate && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {selectedCoordinate.latitude}, {selectedCoordinate.longitude}
                </Text>
                {selectedAddress && (
                    <Text style={styles.infoText}>
                      {selectedAddress.name} {selectedAddress.postalCode}
                    </Text>
                )}
                <Button title="close" onPress={this.closeInfoBox} />
              </View>
          )}
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  map: { flex: 1 },
  infoBox: {
    height: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 20,
  },
});
