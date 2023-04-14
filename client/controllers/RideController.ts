import * as express from 'express';
import Controller from '../interfaces/IController';
import rideModel from '../schemas/Ride';
import vehicleModel from '../schemas/Vehicle';
import groupModel from '../schemas/Groups';
import { request } from 'http';
import { IVehicle } from '../interfaces/IVehicle';

export default class RideController implements Controller {
	public path = '/ride';
	public router = express.Router();

	private ride = rideModel;
	private userVehicle = vehicleModel;
	private userGroup = groupModel;

	constructor() {
		this.initRoutes();
	}

	/**
	 * Initialize all the routes.
	 */
	public initRoutes() {
		this.router.get(this.path, this.getAllRides);
		this.router.get(`${this.path}/rides`, this.getEveryRide);
		this.router.get(`${this.path}/bydriver`, this.getAllRidesByDriverID);
		this.router.get(`${this.path}/:id`, this.getRideById);
		this.router.put(`${this.path}/:id`, this.modifyRide);
		this.router.delete(`${this.path}/:id`, this.deleteRide);
		this.router.post(this.path, this.createRide);
		this.router.post(`${this.path}/getVehicleDetails`, this.getVehicle);
		this.router.post(`${this.path}/vehicleSubmit`, this.addVehicle);
	}

    private getEveryRide = (
		request: express.Request,
		response: express.Response
	) =>{

        this.ride.find()
        .then((data) => {
            response.send(data)
        })
        .catch((err) => {
            console.log('err in geteveryride' , err);
        })
    }
	private addVehicle = (
		request: express.Request,
		response: express.Response
	) => {
		// Should be a Ivehicle interface

		const { vehicleType, vehicleRegNo, vehicleSpecification, driverID } =
			request.body;
		console.log('received data:');
		console.log(request.body);
		const createdVehicle = new this.userVehicle({
			vehicleType,
			vehicleRegNo,
			vehicleSpecification,
			driverID,
		});
		createdVehicle.save().then((savedPost) => {
            console.log('savedPost', savedPost)
            response.send(savedPost);
		}).catch((err) => {
            console.log('err in posting vehicle details' , err)
            response.sendStatus(404);   
        })
	};
	private getVehicle = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('called getVehicle');
		console.log('request.body', request.body);
		console.log('helooooo');

		const driverID = request.body.driverID;
		console.log('driverID', driverID);
		// const emailID = loginData.emailID;

		this.userVehicle.findOne({ driverID: driverID }).then((founduser) => {
			if (founduser) {
				console.log('founduser', founduser);
				response.sendStatus(200);
				// response.send(founduser);
			} else {
				console.log('user not found');
				response.sendStatus(400)
			}
		});
	};
	/**
	 * Get all the entries following the Ride schema.
	 */
	private getAllRides = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('get list of rides');

		// If direction is specificed, show only one direction.
		const dir = request.query.dir.valueOf();

		// If date is specificed, show only dates greater than or equal to that one.
		const date = new Date(request.query.date.valueOf().toString());

		// When ready, specify also $lte in the date filter.
		// (https://stackoverflow.com/questions/39940595/gte-and-lte-in-mongoose-with-multiple-condition)
		// Sort rides in order.
		if (dir) {
			this.ride
				.find({
					category: dir,
					date: {
						$gte: date,
					},
				})
				.sort({ date: '1' })
				.then((rides) => {
					response.send(rides);
				});
		} else {
			this.ride.find().then((rides) => {
				response.send(rides);
			});
		}
	};

	/**
	 * Get all the entries following the Ride schema.
	 */
	private getAllRidesByDriverID = (
		request: express.Request,
		response: express.Response
	) => {
		// Get the driverID
		console.log('rides by driver called');
		
		const driverID = request.query.driverID.valueOf();
		const date = new Date();

		// Sort rides in order.
		try {
			if (driverID) {
				this.ride
					.find({
						driverID: driverID,
						// date: {
						// 	$gte: date,
						// },
					})
					.sort({ date: '1' })
					.then((rides) => {
						console.log('rides by driver', rides)
						response.send(rides);
					});
			} else {
				console.log('no driver id')
				response.send();
			}
		} catch {
			response.send();
		}
	};

	/**
	 * Get a ride by the specific ID.
	 */
	private getRideById = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		console.log(id);
		this.ride.findById(id).then((ride) => {
			response.send(ride);
		});
	};

	/**
	 * Update information regarding a ride.
	 */
	private modifyRide = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		const rideData = request.body;
		this.ride.findByIdAndUpdate(id, rideData, { new: true }).then((ride) => {
			response.send(ride);
		});
	};

	/**
	 * Add a new ride to the database.
	 */
	private createRide = (
		request: express.Request,
		response: express.Response
	) => {
		// Should be a IRide interface
		const rideData = request.body;
		console.log('received data:');
		console.log(request.body);
		const createdRide = new this.ride(rideData);
		createdRide.save().then((savedPost) => {
			response.send(savedPost);
		});
	};

	/**
	 * Delete a ride by its ID number.
	 */
	private deleteRide = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		this.ride.findByIdAndDelete(id).then((successResponse) => {
			if (successResponse) {
				response.sendStatus(200);
			} else {
				response.sendStatus(404);
			}
		});
	};
}
