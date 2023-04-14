import React, { Component } from "react";
import "../css/App.css";
import DynamicRides from "./DynamicRides.jsx";
import DatePicker from "react-datepicker";
import LocationConstants from "./LocationConstants.ts";

import "react-datepicker/dist/react-datepicker.css";
import request from "request";
// import { log } from 'console';

/**
 * Front page with all the rides available, subject to filter.
 * @TODO make Listings actionable to contact the driver and populate firstname/lastname from userID.
 */
class Listings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ChiToChamp: true,
      searchDate: new Date(),
      Rides: null,
      category: "",
    };

    this.toggleList = this.toggleList.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);

    this.getListOfRides = this.getListOfRides.bind(this);
    this.getAllRides = this.getAllRides.bind(this);
    // this.getListOfRides();
    this.getAllRides();
  }

  /**
   * Depending on state, get the list of all relevant rides from mongodb.
   */

  getAllRides() {
    const uri = `https://poolbackend-rotaa.onrender.com/ride/rides`;

    // Get user id and send it in with the post request.

    self = this;

    fetch(uri, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
        // self.setState((state) => ({
        //     rides :
        // }))
      })
      .then((data) => {
        const map = new Map();
        data.forEach((ride) => {
          if (map.has(ride.category)) {
            const arr = map.get(ride.category);
            arr.push(ride);
            map.set(ride.category, arr);
          } else {
            const arr = [ride];
            // arr.push(ride);
            map.set(ride.category, arr);
          }
          // map.set(ride.category , [...ride]);
        });
        self.setState((state) => ({
          Rides: map,
        }));
        console.log("data", data);
      });
  }
  getListOfRides() {
    // Populate the main page with the list of rides in a specific direction.
    var uri = `https://poolbackend-rotaa.onrender.com/ride`;
    uri += "?dir=";
    uri += this.state.ChiToChamp ? "ChicagoToChampaign" : "ChampaignToChicago";
    uri += "&date=";
    uri += this.state.searchDate.toString();

    const displayRides = [];
    const self = this;

    var departureConsts, destinationConsts;
    if (this.state.ChiToChamp) {
      departureConsts = LocationConstants.ChicagoPlaces;
      destinationConsts = LocationConstants.ChampaignPlaces;
    } else {
      departureConsts = LocationConstants.ChampaignPlaces;
      destinationConsts = LocationConstants.ChicagoPlaces;
    }

    request.get(uri, function (error, response, body) {
      // Print the error if one occurred
      if (error) {
        console.error("error:", error);
      }
      // Print the response status code if a response was received
      console.log("statusCode:", response && response.statusCode);
      // Print the HTML for all rides query.
      console.log("body:", body);

      const rides = JSON.parse(body);

      // Convert to array in order to use nice syntax. make sure to follow the schema pattens.
      for (const ride of rides) {
        var departurePlace, destinationPlace;
        departurePlace = departureConsts[ride.departure].place;
        destinationPlace = destinationConsts[ride.destination].place;

        console.log(ride);

        displayRides.push({
          key: ride._id,
          rideID: ride._id,
          driverID: ride.driverID,
          departure: departurePlace,
          destination: destinationPlace,
          date: ride.date,
          price: ride.price,
          numberOfSeats: ride.numberOfSeats,
        });
      }

      self.setState((state) => ({
        Rides: displayRides,
      }));
    });
  }

  /**
   * Handle when user presses the toggle button to switch the direction of rides.
   */
  toggleList() {
    this.setState(
      (state) => ({
        ChiToChamp: !state.ChiToChamp,
      }),
      function () {
        this.getListOfRides();
      }
    );
  }

  /**
   * Handle when user modifies the date selected on the drop down calendar.
   */
  handleDateChange(date) {
    const tempdate = new Date(date);
    console.log(this.state.searchDate);

    // Get the 00:00:00 time date to help with search.
    this.setState(
      {
        searchDate: new Date(tempdate.toDateString()),
      },
      function () {
        this.getListOfRides();
      }
    );
  }
  async handleClick() {
    console.log("clicked.....");
    const uri = `https://poolbackend-rotaa.onrender.com/user/checktoken`;

    const self = this;

    const func = () =>
      fetch(uri, {
        method: "POST",
      }).then(function (response) {
        // Check if login worked. If not, then show not logged in.
        if (response.status == 404 || response.status == 401) {
          self.setState((state) => ({
            loggedIn: false,
          }));
        }
        const res = response.json();
        console.log(res);
        return res;
      });
    const auth = await func();
    console.log("auth", auth);
  }
  handleCategoryChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }
  render() {
    // showShowEdit should be flipped to false after testing.
    const categories = this.state.Rides
      ? Array.from(this.state.Rides.keys())
      : [];
    return (
      <div className="Listing">
        {/* <Heading ChiToChamp={this.state.ChiToChamp} /> 
                <div>
                    <button className="toggleButton" onClick={this.toggleList} type="button">Switch Directions</button>
                    <DatePicker className="searchFilter" name="searchDate" selected={this.state.searchDate} onChange={this.handleDateChange} dateFormat="MMMM d, yyyy" minDate={new Date()}/>
                    <br></br>
                </div>
                <DynamicRides rides={this.state.Rides} shouldShowEdit={false}/>
                <button onClick={this.handleClick}>click me</button> */}
        <select
          className="NewRideFormInput"
          name="category"
          value={this.state.category}
          onChange={this.handleCategoryChange}
        >
          {categories.map((category) => {
            return (
              <option key={category} value={category}>
                {category}
              </option>
            );
          })}
        </select>
        {this.state.Rides && this.state.category && (
          <div>
            <DynamicRides
              rides={this.state.Rides.get(this.state.category)}
            ></DynamicRides>
          </div>
        )}
      </div>
    );
  }
}

/**
 * A lightweight component for displaying a heading.
 */
const chiToChaText = "Chicago to Champaign";
const chaToChiText = "Champaign to Chicago";
const Heading = ({ ChiToChamp }) =>
  ChiToChamp ? <h1>{chiToChaText}</h1> : <h1>{chaToChiText}</h1>;

export default Listings;
